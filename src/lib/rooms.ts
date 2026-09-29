import "server-only";
import { randomInt } from "node:crypto";
import { ObjectId, type ClientSession, type Filter } from "mongodb";
import type { CurrentUser } from "./auth";
import { GameError, isDuplicateKeyError } from "./errors";
import { getJudge } from "./judge";
import {
  chatMessagesCollection,
  presenceCollection,
  roomsCollection,
  scoreEventsCollection,
  usersCollection,
  withTransaction,
  type ScoreEventDoc,
  type ScoreReason,
} from "./mongodb";
import { GENRES, POPULAR_GENRES, genreForJudge, isGenreId } from "./catalog";
import {
  CARDS_PER_PLAYER,
  GENRE_OPTIONS,
  LISTEN_GRACE_MS,
  MIN_SONGS_PER_PLAYER,
  PRESENCE_WINDOW_SECONDS,
  SCORING,
  SETUP_SECONDS,
  TURN_GRACE_MS,
  TURN_SECONDS,
  WAITING_ROOM_MINUTES,
  REVIEWS_PER_PLAYER,
  REVIEW_SECONDS,
  YELLOWS_BEFORE_SENDING_OFF,
  listenRatio,
} from "./rules";
import type {
  CardColor,
  LocalizedText,
  ChatRole,
  CoinSide,
  EndReason,
  GenreOptionView,
  MatchPlayer,
  MatchSetup,
  Move,
  Phase,
  PlayerSlot,
  ReviewState,
  ReviewView,
  Room,
  RoomView,
  SetupView,
  Verdict,
} from "./types";
import { resolveTrack } from "./youtube";

/*
 * Before the first song
 * ---------------------
 * 1. Both seats filled, and a coin decides who opens: whoever is quickest
 *    throws it, whoever is quickest calls a side, the other side falls to the
 *    opponent. The landing is drawn when the coin goes up and stays hidden
 *    until a side is called, so nobody calls a toss they already know.
 * 2. The player who lost the toss names the genre, from what the two profiles
 *    have in common. The winner may refuse once; the second proposal is final.
 * 3. Until the first song is sent, either player may walk away for nothing.
 * Each step gets SETUP_SECONDS; when it runs out the server settles it.
 *
 * How a fight flows
 * -----------------
 * 1. A player sends a song. The referee rules on it right away, but the ruling
 *    stays sealed. The opening song is ruled against the agreed genre, every
 *    other song against the one before it.
 * 2. The opponent must hear most of it, then makes a call: yellow card, red
 *    card, or no card. They may skip the listening for SCORING.skipPenalty;
 *    a skipped song can still get a yellow card, never a red one.
 * 3. That call breaks the seal. The song's owner gets the referee's points,
 *    plus a card penalty if the referee agrees the song didn't fit. A card on
 *    a song the referee accepted is simply wasted.
 * 4. The opponent now sends their own song, and it starts again.
 *
 * How it ends
 * -----------
 * - Both press "Maçı Bitir", allowed once each has sent the same number of
 *   songs and at least MIN_SONGS_PER_PLAYER.
 * - Someone presses "Pes Et".
 * - The player on turn lets TURN_SECONDS pass after the listening window.
 * Bonuses are only paid when both players reached the song minimum.
 */

/** Ambiguous characters (0/O, 1/I) are left out so codes survive being read aloud. */
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 5;
const CODE_PATTERN = new RegExp(`^[${CODE_ALPHABET}]{${CODE_LENGTH}}$`);

function newCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  }
  return code;
}

export function normalizeRoomCode(input: string): string | null {
  const code = input.trim().toUpperCase();
  return CODE_PATTERN.test(code) ? code : null;
}

const otherSlot = (slot: PlayerSlot): PlayerSlot => (slot === "a" ? "b" : "a");

function makePlayer(slot: PlayerSlot, user: CurrentUser): MatchPlayer {
  return {
    slot,
    userId: user.id,
    nickname: user.nickname,
    avatar: user.avatar,
    score: 0,
    cards: { ...CARDS_PER_PLAYER },
    reviews: REVIEWS_PER_PLAYER,
    wantsToEnd: false,
    joinedAt: new Date(),
  };
}

function slotOf(room: Room, userId: string): PlayerSlot | null {
  return room.players.find((player) => player.userId === userId)?.slot ?? null;
}

function playerIndex(room: Room, slot: PlayerSlot): number {
  return room.players.findIndex((player) => player.slot === slot);
}

function requireSlot(room: Room, user: CurrentUser): PlayerSlot {
  const slot = slotOf(room, user.id);
  if (!slot) throw new GameError("notAPlayer", 403);
  return slot;
}

function requireActive(room: Room): void {
  if (room.status === "waiting") throw new GameError("opponentNotJoined", 409);
  if (room.status === "expired") throw new GameError("roomClosed", 409);
  if (room.status === "finished") throw new GameError("matchOver", 409);
}

/** Rooms written before a setting existed default to open. */
/** A restricted account plays nothing and watches nothing. */
function requireUnrestricted(user: CurrentUser): void {
  if (user.restricted) throw new GameError("accountRestricted", 403);
}

const spectatorsAllowed = (room: Room) => room.spectatorsAllowed !== false;
/** Rooms created before players could mute the gallery default to letting it talk. */
const spectatorChatAllowed = (room: Room) => room.spectatorChatAllowed !== false;

// ─── Match setup: the coin and the genre ────────────────────────────────────

const coinSide = (): CoinSide => (randomInt(2) === 0 ? "yazi" : "tura");
const otherSide = (side: CoinSide): CoinSide => (side === "yazi" ? "tura" : "yazi");

function emptySetup(): MatchSetup {
  return {
    coin: { thrownBy: null, thrownAt: null, pickedBy: null, pick: null, result: null, starter: null, resolvedAt: null, auto: false },
    genre: { options: [], picker: null, proposed: null, vetoed: false, genre: null, stageAt: null, lockedAt: null, auto: false },
  };
}

/** Rooms from before the setup existed have nothing to settle and start straight away. */
const setupDone = (room: Room): boolean => !room.setup || room.setup.genre.lockedAt !== null;

function requireSetup(room: Room): MatchSetup {
  if (!room.setup) throw new GameError("noSetup", 409);
  if (room.setup.genre.lockedAt) throw new GameError("matchAlreadyStarted", 409);
  return room.setup;
}

/** The moment the match proper began: the genre locking, or the join on older rooms. */
function matchStart(room: Room): Date {
  return room.setup?.genre.lockedAt ?? room.startedAt ?? room.updatedAt;
}

/** When the server stops waiting on a player and settles the current setup step itself. */
function setupDeadline(room: Room): number | null {
  const setup = room.setup;
  if (!setup || room.status !== "active" || setup.genre.lockedAt) return null;

  const from = setup.coin.resolvedAt ? setup.genre.stageAt : (setup.coin.thrownAt ?? room.startedAt);
  return from ? from.getTime() + SETUP_SECONDS * 1000 : null;
}

/**
 * The genres on offer: everything both players listed on their profiles, in
 * catalogue order, topped up with popular ones when the two lists barely meet.
 */
async function genreOptionsFor(room: Room): Promise<string[]> {
  const users = await usersCollection();
  const docs = await users
    .find({ _id: { $in: room.players.map((player) => new ObjectId(player.userId)) } }, { projection: { genres: 1 } })
    .toArray();

  const lists = docs.map((doc) => new Set(doc.genres ?? []));
  const options =
    lists.length === 2 ? GENRES.map((genre) => genre.id).filter((id) => lists.every((list) => list.has(id))) : [];

  for (const id of POPULAR_GENRES) {
    if (options.length >= GENRE_OPTIONS) break;
    if (!options.includes(id)) options.push(id);
  }
  return options;
}

/**
 * The fields that land the coin. `pickedBy` owns `side`; the opponent gets the
 * other one, and whoever holds the side that came up opens the match.
 */
function coinLanding(room: Room, pickedBy: PlayerSlot, side: CoinSide, auto: boolean, now: Date) {
  const result = room.setup?.coin.result ?? coinSide();
  const starter = result === side ? pickedBy : otherSlot(pickedBy);

  return {
    "setup.coin.pickedBy": pickedBy,
    "setup.coin.pick": side,
    "setup.coin.result": result,
    "setup.coin.starter": starter,
    "setup.coin.resolvedAt": now,
    "setup.coin.auto": auto,
    // The loser of the toss names the genre, and their clock starts now.
    "setup.genre.picker": otherSlot(starter),
    "setup.genre.stageAt": now,
    turn: starter,
    updatedAt: now,
  };
}

function genreLock(genre: string, auto: boolean, now: Date) {
  return {
    "setup.genre.genre": genre,
    "setup.genre.proposed": null,
    "setup.genre.stageAt": null,
    "setup.genre.lockedAt": now,
    "setup.genre.auto": auto,
    updatedAt: now,
  };
}

/**
 * Settles one expired setup step. Each step resets the clock, so a room that
 * has been left alone works its way through on successive polls.
 */
async function settleSetup(room: Room): Promise<Room> {
  const setup = room.setup;
  if (!setup) return room;

  const rooms = await roomsCollection();
  const now = new Date();

  if (!setup.coin.resolvedAt) {
    // Nobody threw it, or nobody called a side: the server does both.
    const owner = setup.coin.thrownBy ?? "a";
    const options = await genreOptionsFor(room);
    const landed = await rooms.findOneAndUpdate(
      { code: room.code, status: "active", "setup.coin.pick": null },
      {
        $set: {
          ...coinLanding(room, owner, coinSide(), true, now),
          "setup.coin.thrownAt": setup.coin.thrownAt ?? now,
          "setup.genre.options": options,
        },
      },
      { returnDocument: "after", projection: { _id: 0 } },
    );
    return landed ?? loadRoom(room.code);
  }

  // A proposal nobody answered counts as accepted; silence on the pick is the server's call.
  const choice = setup.genre.proposed ?? setup.genre.options[randomInt(Math.max(1, setup.genre.options.length))];
  if (!choice) return room;

  const locked = await rooms.findOneAndUpdate(
    { code: room.code, status: "active", "setup.genre.lockedAt": null },
    { $set: genreLock(choice, setup.genre.proposed === null, now) },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  return locked ?? loadRoom(room.code);
}

function listenWindowEnd(move: Move): number {
  return move.createdAt.getTime() + move.track.durationSeconds * listenRatio() * 1000;
}

/** The server refuses a card call before this moment, whatever the browser claims. */
function listenUnlockAt(move: Move): number {
  return listenWindowEnd(move) - LISTEN_GRACE_MS;
}

/** When the player on turn must have sent their song. Silent until the setup is over. */
function turnDeadline(room: Room): number | null {
  if (room.status !== "active" || !setupDone(room)) return null;
  const last = room.moves.at(-1);
  // After a song lands the clock starts when its listening window closes;
  // the opener's clock starts when the genre is settled.
  if (openReview(room)) return null;
  const start = last ? listenWindowEnd(last) : matchStart(room).getTime();
  return start + TURN_SECONDS * 1000 + (last?.reviewPausedMs ?? 0);
}

function songCounts(room: Room): Record<PlayerSlot, number> {
  const counts = { a: 0, b: 0 };
  for (const move of room.moves) counts[move.slot] += 1;
  return counts;
}

/** The move whose card is still waiting on a video check, if any. */
function openReview(room: Room): Move | null {
  const last = room.moves.at(-1);
  return last?.review && last.review.outcome === null ? last : null;
}

const reviewDeadline = (review: ReviewState): number => review.openedAt.getTime() + REVIEW_SECONDS * 1000;

function toReviewView(move: Move): ReviewView | null {
  const review = move.review;
  if (!review) return null;
  return {
    slot: review.slot,
    outcome: review.outcome,
    reason: review.reason,
    auto: review.auto,
    deadline: review.outcome === null ? reviewDeadline(review) : null,
  };
}

/** A card counts only where the referee agreed with it; the rest book nobody. */
const upheld = (move: Move): boolean => move.card !== null && move.verdict.kind === "mismatch";

/** Cards each player has been shown and the referee upheld, by colour. */
function bookings(room: Room): Record<PlayerSlot, Record<CardColor, number>> {
  const tally = { a: { yellow: 0, red: 0 }, b: { yellow: 0, red: 0 } };
  for (const move of room.moves) {
    if (move.revealed && upheld(move) && move.card) tally[move.slot][move.card] += 1;
  }
  return tally;
}

/** Sent off, as in football: one upheld red, or a second upheld yellow. */
function sentOff(booked: Record<CardColor, number>): boolean {
  return booked.red > 0 || booked.yellow >= YELLOWS_BEFORE_SENDING_OFF;
}

function reachedMinimum(room: Room): boolean {
  const { a, b } = songCounts(room);
  return a >= MIN_SONGS_PER_PLAYER && b >= MIN_SONGS_PER_PLAYER;
}

function canAgreeToEnd(room: Room): boolean {
  const { a, b } = songCounts(room);
  return room.status === "active" && a === b && reachedMinimum(room);
}

async function loadRoom(code: string): Promise<Room> {
  const normalized = normalizeRoomCode(code);
  const rooms = await roomsCollection();
  const room = normalized
    ? await rooms.findOne({ code: normalized }, { projection: { _id: 0 } })
    : null;
  if (!room) throw new GameError("noSuchRoom", 404);
  return room;
}

async function clearRoomChat(code: string): Promise<void> {
  const [chat, presence] = await Promise.all([chatMessagesCollection(), presenceCollection()]);
  await Promise.all([chat.deleteMany({ roomCode: code }), presence.deleteMany({ roomCode: code })]);
}

/**
 * The clocks are applied lazily: whoever next touches the room (a poll, a move)
 * closes an abandoned waiting room or ends a match whose player ran out of time.
 */
async function enforceClocks(room: Room): Promise<Room> {
  const now = Date.now();

  if (room.status === "waiting" && now - room.createdAt.getTime() > WAITING_ROOM_MINUTES * 60_000) {
    const rooms = await roomsCollection();
    const expired = await rooms.findOneAndUpdate(
      { code: room.code, status: "waiting" },
      { $set: { status: "expired", updatedAt: new Date() } },
      { returnDocument: "after", projection: { _id: 0 } },
    );
    await clearRoomChat(room.code);
    return expired ?? loadRoom(room.code);
  }

  const setupLimit = setupDeadline(room);
  if (setupLimit !== null && now > setupLimit) return settleSetup(room);

  const pending = openReview(room);
  if (pending?.review && now > reviewDeadline(pending.review)) {
    return settleReview(room, pending, { outcome: "upheld", reason: null, auto: true });
  }

  const deadline = turnDeadline(room);
  if (deadline !== null && now > deadline + TURN_GRACE_MS) {
    return finishMatch(room.code, { reason: "timeout", loser: room.turn });
  }

  return room;
}

async function loadCurrentRoom(code: string): Promise<Room> {
  return enforceClocks(await loadRoom(code));
}

// ─── Spectators ─────────────────────────────────────────────────────────────

async function touchPresence(room: Room, user: CurrentUser): Promise<void> {
  const presence = await presenceCollection();
  await presence.updateOne(
    { roomCode: room.code, userId: new ObjectId(user.id) },
    { $set: { lastSeenAt: new Date() } },
    { upsert: true },
  );
}

async function countSpectators(room: Room): Promise<number> {
  if (room.status !== "waiting" && room.status !== "active") return 0;
  const presence = await presenceCollection();
  return presence.countDocuments({
    roomCode: room.code,
    // Someone who watched first and then took the seat is a player now.
    userId: { $nin: room.players.map((player) => new ObjectId(player.userId)) },
    lastSeenAt: { $gt: new Date(Date.now() - PRESENCE_WINDOW_SECONDS * 1000) },
  });
}

// ─── Views ──────────────────────────────────────────────────────────────────

const toGenreOption = (id: string): GenreOptionView => id;

/** The setup as everyone may see it: the landing stays hidden while the coin is in the air. */
function toSetupView(room: Room): SetupView | null {
  const setup = room.setup;
  if (!setup) return null;

  const { coin, genre } = setup;
  const landed = coin.resolvedAt !== null;
  const deadline = setupDeadline(room);

  return {
    coin: {
      thrownBy: coin.thrownBy,
      thrownAt: coin.thrownAt?.getTime() ?? null,
      pickedBy: coin.pickedBy,
      sides:
        coin.pick && coin.pickedBy
          ? ({ [coin.pickedBy]: coin.pick, [otherSlot(coin.pickedBy)]: otherSide(coin.pick) } as Record<
              PlayerSlot,
              CoinSide
            >)
          : null,
      // Only once a side has been called; before that it is the server's secret.
      result: landed ? coin.result : null,
      starter: coin.starter,
      resolvedAt: coin.resolvedAt?.getTime() ?? null,
      deadline: landed ? null : deadline,
      auto: coin.auto ?? false,
    },
    genre: {
      options: genre.options.map(toGenreOption),
      picker: genre.picker,
      proposed: genre.proposed ? toGenreOption(genre.proposed) : null,
      vetoed: genre.vetoed,
      locked: genre.genre ? toGenreOption(genre.genre) : null,
      deadline: landed && !genre.lockedAt ? deadline : null,
      auto: genre.auto ?? false,
    },
  };
}

export function toRoomView(room: Room, viewerId: string, spectatorCount = 0): RoomView {
  const me = slotOf(room, viewerId);
  const pending = room.moves.at(-1);
  const hasPending = pending !== undefined && !pending.revealed;
  const live = room.status === "waiting" || room.status === "active";
  const booked = bookings(room);

  let phase: Phase;
  if (room.status === "finished") phase = "finished";
  else if (room.status === "expired") phase = "expired";
  else if (!me) phase = room.status === "waiting" ? "join" : "spectate";
  else if (room.status === "waiting") phase = "waiting";
  else if (!setupDone(room)) phase = room.setup?.coin.resolvedAt ? "genre" : "coin";
  else if (openReview(room)) phase = "review";
  else if (room.turn !== me) phase = "opponent";
  else if (hasPending && pending.slot !== me) phase = "listen";
  else phase = "send";

  return {
    code: room.code,
    status: room.status,
    turn: room.turn,
    winner: room.winner,
    players: room.players.map(({ slot, nickname, avatar, score, cards, reviews, wantsToEnd }) => ({
      slot,
      nickname,
      avatar,
      score,
      cards,
      booked: booked[slot],
      reviews: reviews ?? REVIEWS_PER_PLAYER,
      wantsToEnd,
    })),
    moves: room.moves.map((move) => ({
      index: move.index,
      slot: move.slot,
      // The referee's reading of artist and genre is part of the reveal.
      track: move.revealed ? move.track : { ...move.track, artist: null, song: null, genre: null },
      revealed: move.revealed,
      verdict: move.revealed ? move.verdict : null,
      card: move.card,
      skipped: move.skipped ?? false,
      songPoints: move.revealed ? move.songPoints : null,
      cardPenalty: move.revealed ? move.cardPenalty : null,
      review: toReviewView(move),
      createdAt: move.createdAt.toISOString(),
    })),
    me,
    phase,
    setup: live ? toSetupView(room) : null,
    genre: room.setup?.genre.genre ? toGenreOption(room.setup.genre.genre) : null,
    canCancel: me !== null && live && room.moves.length === 0,
    listenRatio: listenRatio(),
    listenUnlockAt: hasPending ? listenUnlockAt(pending) : null,
    turnDeadline: turnDeadline(room),
    canAgreeToEnd: canAgreeToEnd(room),
    spectatorsAllowed: spectatorsAllowed(room),
    spectatorChatAllowed: spectatorChatAllowed(room),
    refereeStandIn: getJudge().id === "mock",
    spectatorCount,
    endReason: room.endReason ?? null,
    forfeitedBy: room.forfeitedBy ?? null,
    bonusAwarded: room.bonusAwarded ?? false,
    version: room.updatedAt.getTime(),
  };
}

async function viewFor(room: Room, user: CurrentUser): Promise<RoomView> {
  return toRoomView(room, user.id, await countSpectators(room));
}

// ─── Points ─────────────────────────────────────────────────────────────────

interface Settlement {
  songPoints: number;
  cardPenalty: number;
}

function settle(move: Move, card: CardColor | null): Settlement {
  const upheld = card !== null && move.verdict.kind === "mismatch";
  return {
    songPoints: SCORING[move.verdict.kind],
    cardPenalty: upheld ? SCORING.cardPenalty[card] : 0,
  };
}

function scoreEvent(
  room: Room,
  slot: PlayerSlot,
  points: number,
  reason: ScoreReason,
  moveIndex: number | null,
  at: Date,
): ScoreEventDoc {
  const player = room.players[playerIndex(room, slot)];
  return { userId: new ObjectId(player.userId), points, reason, roomCode: room.code, moveIndex, createdAt: at };
}

function settlementEvents(room: Room, move: Move, settlement: Settlement, at: Date): ScoreEventDoc[] {
  const events: ScoreEventDoc[] = [];
  if (settlement.songPoints !== 0) {
    const reason = settlement.songPoints > 0 ? "song_match" : "song_mismatch";
    events.push(scoreEvent(room, move.slot, settlement.songPoints, reason, move.index, at));
  }
  if (settlement.cardPenalty !== 0) {
    events.push(scoreEvent(room, move.slot, settlement.cardPenalty, "card_penalty", move.index, at));
  }
  return events;
}

/** Appends to the ledger and bumps lifetime totals. Runs inside the room's transaction. */
async function recordPoints(events: ScoreEventDoc[], session: ClientSession): Promise<void> {
  if (events.length === 0) return;

  const [ledger, users] = await Promise.all([scoreEventsCollection(), usersCollection()]);
  await ledger.insertMany(events, { session });

  const totals = new Map<string, number>();
  for (const event of events) {
    const id = event.userId.toHexString();
    totals.set(id, (totals.get(id) ?? 0) + event.points);
  }

  // Sequential on purpose: operations in one transaction must not run in parallel.
  for (const [id, points] of totals) {
    await users.updateOne({ _id: new ObjectId(id) }, { $inc: { totalPoints: points } }, { session });
  }
}

// ─── Actions ────────────────────────────────────────────────────────────────

/** Opens a friend fight with `user` as host. Returns the room code. */
export async function createRoom(user: CurrentUser): Promise<string> {
  requireUnrestricted(user);
  const rooms = await roomsCollection();

  // Codes are short, so a collision is possible - retry a few times.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const now = new Date();
    const room: Room = {
      code: newCode(),
      mode: "friend",
      status: "waiting",
      players: [makePlayer("a", user)],
      moves: [],
      turn: "a",
      winner: null,
      setup: emptySetup(),
      spectatorsAllowed: true,
      spectatorChatAllowed: true,
      startedAt: null,
      endReason: null,
      forfeitedBy: null,
      bonusAwarded: false,
      createdAt: now,
      updatedAt: now,
      finishedAt: null,
    };

    try {
      await rooms.insertOne(room);
      return room.code;
    } catch (error) {
      if (!isDuplicateKeyError(error)) throw error;
    }
  }

  throw new GameError("roomCreateFailed", 500);
}

/**
 * The room as `user` may see it. Non-players become spectators once the match
 * is running, or earlier when they chose to watch a room that hasn't started.
 */
export async function getRoomView(
  code: string,
  user: CurrentUser,
  options: { watching?: boolean } = {},
): Promise<RoomView> {
  const room = await loadCurrentRoom(code);
  const isPlayer = slotOf(room, user.id) !== null;
  const spectating = !isPlayer && (room.status === "active" || (room.status === "waiting" && options.watching));

  if (spectating) {
    requireUnrestricted(user);
    if (!spectatorsAllowed(room)) throw new GameError("spectatorsBlocked", 403);
    await touchPresence(room, user);
  }

  return viewFor(room, user);
}

export async function joinRoom(code: string, user: CurrentUser): Promise<RoomView> {
  const room = await loadCurrentRoom(code);
  if (slotOf(room, user.id)) return viewFor(room, user);
  requireUnrestricted(user);
  if (room.status === "expired") throw new GameError("roomClosed", 409);
  if (room.status !== "waiting") throw new GameError("roomFull", 409);

  const rooms = await roomsCollection();
  const now = new Date();
  const updated = await rooms.findOneAndUpdate(
    // The size guard makes a simultaneous second join lose instead of overwriting.
    { code: room.code, status: "waiting", players: { $size: 1 } },
    {
      $push: { players: makePlayer("b", user) },
      $set: { status: "active", startedAt: now, updatedAt: now },
    },
    { returnDocument: "after", projection: { _id: 0 } },
  );

  if (!updated) throw new GameError("roomJustFilled", 409);
  return viewFor(updated, user);
}

/**
 * Throws the coin. Whoever gets here first does it for both, and the landing is
 * drawn now but kept back until someone calls a side.
 */
export async function throwCoin(code: string, user: CurrentUser): Promise<RoomView> {
  const room = await loadCurrentRoom(code);
  const me = requireSlot(room, user);
  requireActive(room);
  const setup = requireSetup(room);
  // The opponent was quicker - no error, that is the whole point of the race.
  if (setup.coin.thrownAt) return viewFor(room, user);

  const rooms = await roomsCollection();
  const now = new Date();
  const updated = await rooms.findOneAndUpdate(
    { code: room.code, status: "active", "setup.coin.thrownAt": null },
    {
      $set: {
        "setup.coin.thrownBy": me,
        "setup.coin.thrownAt": now,
        "setup.coin.result": coinSide(),
        updatedAt: now,
      },
    },
    { returnDocument: "after", projection: { _id: 0 } },
  );

  return viewFor(updated ?? (await loadRoom(code)), user);
}

/** Calls a side while the coin is up. The opponent is left with the other one. */
export async function callCoin(code: string, user: CurrentUser, side: CoinSide): Promise<RoomView> {
  const room = await loadCurrentRoom(code);
  const me = requireSlot(room, user);
  requireActive(room);
  const setup = requireSetup(room);

  if (!setup.coin.thrownAt) throw new GameError("throwCoinFirst", 409);
  if (setup.coin.resolvedAt) return viewFor(room, user);

  const options = await genreOptionsFor(room);
  const rooms = await roomsCollection();
  const now = new Date();
  const updated = await rooms.findOneAndUpdate(
    // pick: null in the filter means the faster of two simultaneous calls wins.
    { code: room.code, status: "active", "setup.coin.pick": null, "setup.coin.thrownAt": { $ne: null } },
    { $set: { ...coinLanding(room, me, side, false, now), "setup.genre.options": options } },
    { returnDocument: "after", projection: { _id: 0 } },
  );

  return viewFor(updated ?? (await loadCurrentRoom(code)), user);
}

/**
 * The loser of the toss names the genre. The first proposal goes to the
 * opponent for approval; after a refusal the next one is final.
 */
export async function proposeGenre(code: string, user: CurrentUser, genre: string): Promise<RoomView> {
  const room = await loadCurrentRoom(code);
  const me = requireSlot(room, user);
  requireActive(room);
  const setup = requireSetup(room);

  if (!setup.coin.resolvedAt) throw new GameError("coinFirst", 409);
  if (setup.genre.picker !== me) throw new GameError("genreNotYours", 403);
  if (setup.genre.proposed) throw new GameError("awaitingAnswer", 409);
  if (!isGenreId(genre) || !setup.genre.options.includes(genre)) {
    throw new GameError("genreNotAnOption", 422);
  }

  const rooms = await roomsCollection();
  const now = new Date();
  const final = setup.genre.vetoed;
  const updated = await rooms.findOneAndUpdate(
    { code: room.code, status: "active", "setup.genre.lockedAt": null, "setup.genre.proposed": null },
    {
      $set: final
        ? genreLock(genre, false, now)
        : { "setup.genre.proposed": genre, "setup.genre.stageAt": now, updatedAt: now },
    },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  if (!updated) throw new GameError("stateChangedRefresh", 409);

  return viewFor(updated, user);
}

/** The toss winner's answer to the proposed genre: accept it, or spend the one refusal. */
export async function answerGenre(code: string, user: CurrentUser, accept: boolean): Promise<RoomView> {
  const room = await loadCurrentRoom(code);
  const me = requireSlot(room, user);
  requireActive(room);
  const setup = requireSetup(room);

  const proposed = setup.genre.proposed;
  if (!proposed) throw new GameError("noProposal", 409);
  if (setup.genre.picker === me) throw new GameError("cannotAnswerOwn", 403);
  if (!accept && setup.genre.vetoed) throw new GameError("vetoUsed", 409);

  // Never empty the list: the picker still has to be able to name something.
  const left = setup.genre.options.filter((id) => id !== proposed);
  const rooms = await roomsCollection();
  const now = new Date();
  const updated = await rooms.findOneAndUpdate(
    { code: room.code, status: "active", "setup.genre.lockedAt": null, "setup.genre.proposed": proposed },
    {
      $set: accept
        ? genreLock(proposed, false, now)
        : {
            "setup.genre.vetoed": true,
            "setup.genre.proposed": null,
            "setup.genre.options": left.length > 0 ? left : setup.genre.options,
            "setup.genre.stageAt": now,
            updatedAt: now,
          },
    },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  if (!updated) throw new GameError("stateChangedRefresh", 409);

  return viewFor(updated, user);
}

/**
 * Walking away before a single song has been played. Nothing is scored - no
 * forfeit, no bonus, no ledger entry - because no match really happened.
 */
export async function cancelMatch(code: string, user: CurrentUser): Promise<RoomView> {
  const room = await loadCurrentRoom(code);
  requireSlot(room, user);
  if (room.status === "expired") throw new GameError("roomAlreadyClosed", 409);
  if (room.status === "finished") throw new GameError("matchOver", 409);
  if (room.moves.length > 0) {
    throw new GameError("cannotLeaveAfterFirstSong", 409);
  }

  const rooms = await roomsCollection();
  const now = new Date();
  const updated = await rooms.findOneAndUpdate(
    { code: room.code, status: { $in: ["waiting", "active"] }, moves: { $size: 0 } },
    {
      $set: {
        status: "finished",
        winner: null,
        endReason: "cancelled",
        forfeitedBy: null,
        bonusAwarded: false,
        finishedAt: now,
        updatedAt: now,
      },
    },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  if (!updated) throw new GameError("matchStartedNoFreeExit", 409);

  await clearRoomChat(code);
  return viewFor(updated, user);
}

export async function submitMove(code: string, user: CurrentUser, url: string): Promise<RoomView> {
  const room = await loadCurrentRoom(code);
  const me = requireSlot(room, user);
  requireActive(room);
  // Nothing moves while a card is upstairs.
  if (openReview(room)) throw new GameError("reviewPending", 409);
  if (!setupDone(room)) throw new GameError("setupIncomplete", 409);
  if (room.turn !== me) throw new GameError("notYourTurn", 409);

  const previous = room.moves.at(-1);
  if (previous && !previous.revealed) {
    throw new GameError("decideFirst", 409);
  }

  const track = await resolveTrack(url);
  if (room.moves.some((move) => move.track.videoId === track.videoId)) {
    throw new GameError("songAlreadyPlayed", 409);
  }

  const matchGenre = room.setup?.genre.genre ?? null;
  const judge = getJudge();
  const ruling = await judge.judge({
    previous: previous?.track ?? null,
    current: track,
    history: room.moves.map((move) => move.track),
    // Only the opener is judged against it, but the referee gets the context either way.
    genre: matchGenre ? genreForJudge(matchGenre) : null,
  });

  const verdict: Verdict = {
    kind: ruling.matches ? "match" : "mismatch",
    reason: ruling.reason,
    judgedBy: judge.id,
    confidence: ruling.confidence,
  };

  const move: Move = {
    index: room.moves.length,
    slot: me,
    track: { ...track, artist: ruling.artist, song: ruling.song, genre: ruling.genre },
    verdict,
    revealed: false,
    card: null,
    songPoints: 0,
    cardPenalty: 0,
    createdAt: new Date(),
    revealedAt: null,
  };

  const rooms = await roomsCollection();
  const updated = await rooms.findOneAndUpdate(
    // Turn and move count in the filter: two fast submits can't both land.
    { code: room.code, status: "active", turn: me, moves: { $size: room.moves.length } },
    {
      $push: { moves: move },
      $set: {
        turn: otherSlot(me),
        updatedAt: new Date(),
        // Song counts just became unequal, so any "Maçı Bitir" vote is void.
        "players.0.wantsToEnd": false,
        "players.1.wantsToEnd": false,
      },
    },
    { returnDocument: "after", projection: { _id: 0 } },
  );

  if (!updated) throw new GameError("stateChangedRetrySong", 409);
  return viewFor(updated, user);
}

/**
 * The opponent's call on the pending song: a card, or `null` to let it pass.
 * With `skip`, the call comes before the listening is done: the caller pays
 * SCORING.skipPenalty and may only show a yellow card.
 */
export async function decide(
  code: string,
  user: CurrentUser,
  card: CardColor | null,
  skip = false,
): Promise<RoomView> {
  const room = await loadCurrentRoom(code);
  const me = requireSlot(room, user);
  requireActive(room);
  if (room.turn !== me) throw new GameError("notYourTurn", 409);

  const pending = room.moves.at(-1);
  if (!pending || pending.revealed || pending.slot === me) {
    throw new GameError("nothingToDecide", 409);
  }

  const skipCost = -SCORING.skipPenalty;
  if (skip && card === "red") {
    throw new GameError("noRedOnSkip", 409);
  }
  if (!skip && Date.now() < listenUnlockAt(pending)) {
    const percent = Math.round(listenRatio() * 100);
    throw new GameError("listenFirst", 409, { percent, cost: skipCost });
  }

  const myIndex = playerIndex(room, me);
  if (card) {
    if (room.players[myIndex].cards[card] <= 0) {
      throw new GameError(card === "yellow" ? "noYellowLeft" : "noRedLeft", 409);
    }
  }

  const settlement = settle(pending, card);
  // A card the referee agrees with does not bite yet: it goes upstairs first.
  const upheldNow = card !== null && pending.verdict.kind === "mismatch";
  const ownerIndex = playerIndex(room, pending.slot);
  const at = `moves.${pending.index}`;
  const cardKey = card ? `players.${myIndex}.cards.${card}` : null;
  const now = new Date();

  const updated = await withTransaction(async (session) => {
    const rooms = await roomsCollection();

    const filter: Filter<Room> = {
      code: room.code,
      status: "active",
      turn: me,
      [`${at}.revealed`]: false,
      ...(cardKey ? { [cardKey]: { $gt: 0 } } : {}),
    };

    const result = await rooms.findOneAndUpdate(
      filter,
      {
        $set: {
          [`${at}.revealed`]: true,
          [`${at}.card`]: card,
          [`${at}.skipped`]: skip,
          [`${at}.songPoints`]: settlement.songPoints,
          [`${at}.cardPenalty`]: settlement.cardPenalty,
          [`${at}.revealedAt`]: now,
          ...(upheldNow
            ? {
                [`${at}.review`]: {
                  slot: pending.slot,
                  openedAt: now,
                  outcome: null,
                  reason: null,
                  decidedAt: null,
                  auto: false,
                },
              }
            : {}),
          updatedAt: now,
        },
        $inc: {
          [`players.${ownerIndex}.score`]: settlement.songPoints + settlement.cardPenalty,
          // The owner and the caller are always different players, so these keys never collide.
          ...(skip ? { [`players.${myIndex}.score`]: SCORING.skipPenalty } : {}),
          ...(cardKey ? { [cardKey]: -1 } : {}),
        },
      },
      { returnDocument: "after", projection: { _id: 0 }, session },
    );
    if (!result) throw new GameError("stateChangedRetry", 409);

    const events = settlementEvents(room, pending, settlement, now);
    if (skip) events.push(scoreEvent(room, me, SCORING.skipPenalty, "skip_penalty", pending.index, now));
    await recordPoints(events, session);
    return result;
  });

  // Nothing ends here any more: an upheld card waits for the video check.
  return viewFor(updated, user);
}


// ─── The video check ────────────────────────────────────────────────────────

interface ReviewOutcome {
  outcome: "upheld" | "overturned";
  reason: LocalizedText | null;
  auto: boolean;
}

/**
 * Closes an open check and lets the card do what it was going to do.
 *
 * Upheld, the card counts and may send its owner off. Overturned, the song is
 * treated as a fit after all: the mismatch and the card penalty are paid back,
 * the card returns to the player who showed it, and one compensating row keeps
 * the ledger honest about why the score moved.
 */
async function settleReview(room: Room, move: Move, result: ReviewOutcome): Promise<Room> {
  const now = new Date();
  const review = move.review;
  if (!review || review.outcome !== null) return room;

  const at = `moves.${move.index}`;
  const pausedMs = now.getTime() - review.openedAt.getTime();
  const ownerIndex = playerIndex(room, move.slot);
  const showerIndex = playerIndex(room, otherSlot(move.slot));

  const settled = await withTransaction(async (session) => {
    const rooms = await roomsCollection();
    const set: Record<string, unknown> = {
      [`${at}.review.outcome`]: result.outcome,
      [`${at}.review.reason`]: result.reason,
      [`${at}.review.decidedAt`]: now,
      [`${at}.review.auto`]: result.auto,
      [`${at}.reviewPausedMs`]: pausedMs,
      updatedAt: now,
    };
    const inc: Record<string, number> = {};
    const events: ScoreEventDoc[] = [];

    if (result.outcome === "overturned") {
      const delta = SCORING.match - (move.songPoints + move.cardPenalty);
      Object.assign(set, {
        [`${at}.verdict.kind`]: "match",
        [`${at}.songPoints`]: SCORING.match,
        [`${at}.cardPenalty`]: 0,
        [`${at}.card`]: null,
        ...(result.reason ? { [`${at}.verdict.reason`]: result.reason } : {}),
      });
      inc[`players.${ownerIndex}.score`] = delta;
      // The card was wrong, so it is not spent.
      if (move.card) inc[`players.${showerIndex}.cards.${move.card}`] = 1;
      if (delta !== 0) {
        events.push(scoreEvent(room, move.slot, delta, "review_overturn", move.index, now));
      }
    }

    const result_ = await rooms.findOneAndUpdate(
      { code: room.code, status: "active", [`${at}.review.outcome`]: null },
      Object.keys(inc).length > 0 ? { $set: set, $inc: inc } : { $set: set },
      { returnDocument: "after", projection: { _id: 0 }, session },
    );
    // Someone else settled it a moment ago; their write stands.
    if (!result_) return null;

    await recordPoints(events, session);
    return result_;
  });

  if (!settled) return loadRoom(room.code);

  if (result.outcome === "upheld" && sentOff(bookings(settled)[move.slot])) {
    return finishMatch(settled.code, { reason: "cards", loser: move.slot });
  }
  return settled;
}

/** The player the card was shown to accepts it without asking for a check. */
export async function waiveReview(code: string, user: CurrentUser): Promise<RoomView> {
  const room = await loadCurrentRoom(code);
  const me = requireSlot(room, user);
  requireActive(room);

  const move = openReview(room);
  if (!move || move.review?.slot !== me) throw new GameError("noReviewOpen", 409);
  return viewFor(await settleReview(room, move, { outcome: "upheld", reason: null, auto: false }), user);
}

/**
 * Sends the card upstairs. The second opinion sees the whole match and is
 * asked to be slow about it; whatever it says is the end of the matter.
 */
export async function requestReview(code: string, user: CurrentUser): Promise<RoomView> {
  const room = await loadCurrentRoom(code);
  const me = requireSlot(room, user);
  requireActive(room);

  const move = openReview(room);
  if (!move || move.review?.slot !== me) throw new GameError("noReviewOpen", 409);

  const myIndex = playerIndex(room, me);
  if ((room.players[myIndex].reviews ?? REVIEWS_PER_PLAYER) <= 0) {
    throw new GameError("noReviewsLeft", 409);
  }

  // Spend the check first: the model call is slow, and one press must buy one check.
  const rooms = await roomsCollection();
  const spent = await rooms.findOneAndUpdate(
    {
      code: room.code,
      status: "active",
      [`moves.${move.index}.review.outcome`]: null,
      [`players.${myIndex}.reviews`]: { $gt: 0 },
    },
    { $inc: { [`players.${myIndex}.reviews`]: -1 }, $set: { updatedAt: new Date() } },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  if (!spent) throw new GameError("stateChangedRetry", 409);

  const previous = move.index > 0 ? spent.moves[move.index - 1] : null;
  const ruling = await getJudge().review({
    previous: previous ? previous.track : null,
    current: move.track,
    history: spent.moves.slice(0, move.index).map((m) => m.track),
    genre: spent.setup?.genre.genre ? genreForJudge(spent.setup.genre.genre) : null,
  });

  return viewFor(
    await settleReview(spent, move, {
      outcome: ruling.matches ? "overturned" : "upheld",
      reason: ruling.reason,
      auto: false,
    }),
    user,
  );
}
/** Records or withdraws a "Maçı Bitir" vote. Two votes end the match. */
export async function setEndVote(code: string, user: CurrentUser, wantsToEnd: boolean): Promise<RoomView> {
  const room = await loadCurrentRoom(code);
  const me = requireSlot(room, user);
  requireActive(room);

  if (wantsToEnd && !canAgreeToEnd(room)) {
    throw new GameError("needMinSongs", 409, { min: MIN_SONGS_PER_PLAYER });
  }

  const rooms = await roomsCollection();
  const updated = await rooms.findOneAndUpdate(
    { code: room.code, status: "active" },
    { $set: { [`players.${playerIndex(room, me)}.wantsToEnd`]: wantsToEnd, updatedAt: new Date() } },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  if (!updated) throw new GameError("stateChanged", 409);

  // Checked on the written document, so both players voting at once still ends it.
  const everyoneAgrees = updated.players.length === 2 && updated.players.every((p) => p.wantsToEnd);
  return viewFor(everyoneAgrees ? await finishMatch(room.code, { reason: "agreement" }) : updated, user);
}

export async function surrender(code: string, user: CurrentUser): Promise<RoomView> {
  const room = await loadCurrentRoom(code);
  const me = requireSlot(room, user);
  requireActive(room);
  return viewFor(await finishMatch(room.code, { reason: "surrender", loser: me }), user);
}

/**
 * Either player may open or close the match to spectators, and decide whether
 * the gallery may talk, at any time before the match ends.
 */
export async function setRoomSettings(
  code: string,
  user: CurrentUser,
  settings: { spectatorsAllowed?: boolean; spectatorChatAllowed?: boolean },
): Promise<RoomView> {
  const room = await loadCurrentRoom(code);
  requireSlot(room, user);
  if (room.status === "finished" || room.status === "expired") throw new GameError("matchOver", 409);

  const changes: Partial<Room> = { updatedAt: new Date() };
  if (settings.spectatorsAllowed !== undefined) changes.spectatorsAllowed = settings.spectatorsAllowed;
  if (settings.spectatorChatAllowed !== undefined) changes.spectatorChatAllowed = settings.spectatorChatAllowed;

  const rooms = await roomsCollection();
  const updated = await rooms.findOneAndUpdate(
    { code: room.code, status: { $in: ["waiting", "active"] } },
    { $set: changes },
    { returnDocument: "after", projection: { _id: 0 } },
  );
  if (!updated) throw new GameError("stateChanged", 409);
  return viewFor(updated, user);
}

/** Who may write in a room's chat, and as what. */
export async function roomForChat(code: string, user: CurrentUser): Promise<{ room: Room; role: ChatRole }> {
  const room = await loadCurrentRoom(code);
  if (room.status !== "waiting" && room.status !== "active") {
    throw new GameError("chatClosed", 409);
  }

  const slot = slotOf(room, user.id);
  if (!slot) {
    if (!spectatorsAllowed(room)) throw new GameError("spectatorsBlocked", 403);
    // Reading the chat stays open; only writing is the players' to switch off.
    if (!spectatorChatAllowed(room)) throw new GameError("spectatorChatBlocked", 403);
  }
  return { room, role: slot ?? "spectator" };
}

/** Ends a removed account's live matches as losses, so nobody is left waiting on them. */
export async function forfeitMatchesOf(userId: string): Promise<void> {
  const rooms = await roomsCollection();
  const live = await rooms
    .find({ status: { $in: ["waiting", "active"] }, "players.userId": userId }, { projection: { _id: 0 } })
    .toArray();

  for (const room of live) {
    if (room.status === "waiting") {
      await rooms.updateOne({ code: room.code, status: "waiting" }, { $set: { status: "expired", updatedAt: new Date() } });
      await clearRoomChat(room.code);
      continue;
    }
    const slot = slotOf(room, userId);
    if (slot) await finishMatch(room.code, { reason: "violation", loser: slot });
  }
}

/** "cancelled" never comes through here: it scores nothing, so cancelMatch handles it. */
type Finish =
  | { reason: Extract<EndReason, "agreement"> }
  | { reason: Exclude<EndReason, "agreement" | "cancelled">; loser: PlayerSlot };

async function finishMatch(code: string, finish: Finish): Promise<Room> {
  const result = await withTransaction(async (session) => {
    const rooms = await roomsCollection();
    const room = await rooms.findOne({ code }, { session, projection: { _id: 0 } });
    if (!room) throw new GameError("noSuchRoom", 404);
    // Another request may have ended it a moment ago.
    if (room.status !== "active") return room;

    // Re-check inside the transaction; things may have moved on since the caller looked.
    if (finish.reason === "agreement" && !(canAgreeToEnd(room) && room.players.every((p) => p.wantsToEnd))) {
      return room;
    }
    if (finish.reason === "timeout") {
      const deadline = turnDeadline(room);
      if (room.turn !== finish.loser || deadline === null || Date.now() <= deadline + TURN_GRACE_MS) return room;
    }

    const now = new Date();
    const events: ScoreEventDoc[] = [];
    const players = room.players.map((player) => ({ ...player }));
    const moves = room.moves.map((move) => ({ ...move }));

    // No one gets to call a card on the final song; the referee's word stands.
    const pending = moves.at(-1);
    if (pending && !pending.revealed) {
      const settlement = settle(pending, null);
      Object.assign(pending, {
        revealed: true,
        songPoints: settlement.songPoints,
        cardPenalty: 0,
        revealedAt: now,
      });
      players[playerIndex(room, pending.slot)].score += settlement.songPoints;
      events.push(...settlementEvents(room, pending, settlement, now));
    }

    const [a, b] = players;
    const winner: Room["winner"] =
      finish.reason === "agreement"
        ? a.score === b.score
          ? "draw"
          : a.score > b.score
            ? "a"
            : "b"
        : otherSlot(finish.loser);

    // Bonuses need both players past the minimum, so quick exits can't farm them.
    const bonusAwarded = reachedMinimum(room);
    if (bonusAwarded) {
      if (winner === "draw") {
        events.push(
          scoreEvent(room, "a", SCORING.drawBonus, "draw_bonus", null, now),
          scoreEvent(room, "b", SCORING.drawBonus, "draw_bonus", null, now),
        );
      } else {
        events.push(scoreEvent(room, winner, SCORING.winBonus, "win_bonus", null, now));
      }
    }

    const updated = await rooms.findOneAndUpdate(
      { code, status: "active" },
      {
        $set: {
          status: "finished",
          winner,
          players,
          moves,
          endReason: finish.reason,
          forfeitedBy: finish.reason === "agreement" ? null : finish.loser,
          bonusAwarded,
          finishedAt: now,
          updatedAt: now,
        },
      },
      { returnDocument: "after", projection: { _id: 0 }, session },
    );
    if (!updated) throw new GameError("stateChanged", 409);

    await recordPoints(events, session);
    return updated;
  });

  // Chat only lives as long as the match.
  if (result.status === "finished") await clearRoomChat(code);
  return result;
}
