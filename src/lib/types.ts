/** Domain types shared by the server and the browser. */

import type { Locale } from "@/i18n/config";

/**
 * Text the referee produces. It is written once, read by both players and
 * every spectator, so the model writes it in all three languages at once -
 * there is no second chance to translate it per reader.
 */
export type LocalizedText = Record<Locale, string>;

export type PlayerSlot = "a" | "b";
export type CardColor = "yellow" | "red";

/** A song as resolved from a YouTube link. */
export interface Track {
  videoId: string;
  url: string;
  /** Raw YouTube title, e.g. "Dream Theater - Pull Me Under (Official Video)". */
  title: string;
  channel: string;
  durationSeconds: number;
  /** What the referee read the track as. */
  artist: string | null;
  song: string | null;
  genre: string | null;
}

export type CoinSide = "yazi" | "tura";

export type VerdictKind = "match" | "mismatch";

export interface Verdict {
  kind: VerdictKind;
  /** One or two sentences, shown to everyone once revealed, in every language. */
  reason: LocalizedText;
  /** Which referee produced this, e.g. "mock" or "vertex". */
  judgedBy: string;
  confidence: number;
}

export interface Move {
  index: number;
  slot: PlayerSlot;
  track: Track;
  /** Decided the moment the song is sent, but hidden from everyone until revealed. */
  verdict: Verdict;
  /** Flips once the opponent has listened and made their card call, or when the match ends. */
  revealed: boolean;
  card: CardColor | null;
  /**
   * The opponent answered without listening and paid SCORING.skipPenalty.
   * Absent on moves not yet decided and on moves written before skipping existed.
   */
  skipped?: boolean;
  /** Referee points for the song: +30 or -20. The opener is judged against the match genre. */
  songPoints: number;
  /** Extra penalty when the referee upheld a card; 0 otherwise. */
  cardPenalty: number;
  createdAt: Date;
  revealedAt: Date | null;
  /** The video check on an upheld card. Null when no card stood on this song. */
  review?: ReviewState | null;
  /** How long the clock stood still for that check, handed back to the player on turn. */
  reviewPausedMs?: number;
}

/**
 * A card the referee upheld waits here before it counts. The player it was
 * shown to may send it upstairs; whatever comes back is final.
 */
export interface ReviewState {
  /** Whose card this is, and so who may ask for the check. */
  slot: PlayerSlot;
  openedAt: Date;
  /** Null while the window is still open. */
  outcome: "upheld" | "overturned" | null;
  reason: LocalizedText | null;
  decidedAt: Date | null;
  /** True when nobody asked in time and the window simply closed. */
  auto: boolean;
}

export interface MatchPlayer {
  slot: PlayerSlot;
  userId: string;
  nickname: string;
  avatar: string;
  /** Match score. Only revealed points count. */
  score: number;
  /** Cards this player still has to show. */
  cards: Record<CardColor, number>;
  /** Video checks left. Absent on matches started before the check existed. */
  reviews?: number;
  /** Pressed "Maçı Bitir". */
  wantsToEnd: boolean;
  joinedAt: Date;
}

export type RoomStatus = "waiting" | "active" | "finished" | "expired";

/**
 * agreement - both pressed "Maçı Bitir" · surrender - someone gave up ·
 * timeout - the player on turn ran out of time · cards - sent off by an upheld
 * red card or a second upheld yellow · violation - a player's account was
 * removed · cancelled - someone walked away before the first song, so nothing
 * is scored.
 */
export type EndReason = "agreement" | "surrender" | "timeout" | "cards" | "violation" | "cancelled";

/**
 * The toss that decides who opens. The landing is drawn the moment the coin is
 * thrown but stays hidden until a side is called, so nobody can call a side
 * they already know wins.
 */
export interface CoinState {
  thrownBy: PlayerSlot | null;
  thrownAt: Date | null;
  /** Who called a side, and which one. The opponent gets the other side. */
  pickedBy: PlayerSlot | null;
  pick: CoinSide | null;
  /** The landing. Never leaves the server before `resolvedAt`. */
  result: CoinSide | null;
  /** The player who opens the match. */
  starter: PlayerSlot | null;
  resolvedAt: Date | null;
  /** Nobody called in time, so the server called for them. */
  auto: boolean;
}

/**
 * The genre the opening song is judged against. The coin's loser names it, the
 * winner may refuse it once, and the second proposal is final.
 */
export interface GenreState {
  /** Genre ids on offer: what both players listed on their profiles, topped up if that is thin. */
  options: string[];
  /** Who names the genre - the player who lost the toss. */
  picker: PlayerSlot | null;
  /** Named, waiting for the opponent to accept or refuse. */
  proposed: string | null;
  /** The one refusal has been used, so the next proposal locks straight away. */
  vetoed: boolean;
  genre: string | null;
  /** When the current step began; SETUP_SECONDS runs from here. */
  stageAt: Date | null;
  /** Set when the genre is final. The match - and the turn clock - starts here. */
  lockedAt: Date | null;
  /** Nobody named one in time, so the server drew it from the options. */
  auto: boolean;
}

/**
 * How much of each song has to be heard. Proposed by one player and agreed by
 * the other, because it changes how the whole match feels and neither side
 * should be able to impose it.
 */
export interface ListenState {
  /** A share waiting for the other player's answer. */
  proposed: number | null;
  /** Who put it forward; they cannot accept their own. */
  proposedBy: PlayerSlot | null;
  /** The agreed share. Null until it is settled. */
  ratio: number | null;
  /** When this step began; SETUP_SECONDS runs from here. */
  stageAt: Date | null;
  settledAt: Date | null;
  /** Nobody agreed in time, so the default stands. */
  auto: boolean;
}

export interface MatchSetup {
  coin: CoinState;
  genre: GenreState;
  /** Absent on rooms that predate the choice; those run on the default. */
  listen?: ListenState;
}

export interface Room {
  code: string;
  mode: "friend";
  status: RoomStatus;
  players: MatchPlayer[];
  moves: Move[];
  /** Whose move it is. The coin decides who opens. */
  turn: PlayerSlot;
  winner: PlayerSlot | "draw" | null;
  /**
   * Coin toss and genre pick, both settled before the first song.
   * Absent on rooms created before the setup existed; those simply skip it.
   */
  setup?: MatchSetup;
  /** Players can close the match to spectators. Open by default. */
  spectatorsAllowed: boolean;
  /** Whether spectators may write in the chat. Players decide; reading is always allowed. */
  spectatorChatAllowed: boolean;
  /** When the second player joined and the setup clock started. */
  startedAt: Date | null;
  endReason: EndReason | null;
  /** The player who surrendered, ran out of time, or was removed. */
  forfeitedBy: PlayerSlot | null;
  /** Whether win/draw bonuses were paid (both players reached the song minimum). */
  bonusAwarded: boolean;
  createdAt: Date;
  updatedAt: Date;
  finishedAt: Date | null;
}

/**
 * What the viewer should be doing right now:
 * join - not in the room, may take the free seat or watch · waiting - host waiting for an opponent ·
 * coin - the toss for who opens · genre - settling the genre the opener must hit ·
 * send - pick a song · listen - hear the opponent's song, then make a card call ·
 * opponent - the other player is up · spectate - watching someone else's match ·
 * finished - match over · expired - nobody joined in time.
 */
export type Phase =
  | "join"
  | "waiting"
  | "coin"
  | "genre"
  | "listenRule"
  | "send"
  | "listen"
  | "opponent"
  | "review"
  | "spectate"
  | "finished"
  | "expired";

export interface PlayerView {
  slot: PlayerSlot;
  nickname: string;
  avatar: string;
  score: number;
  cards: Record<CardColor, number>;
  /** Upheld cards shown against this player's songs. Two yellows send them off. */
  booked: Record<CardColor, number>;
  /** Video checks this player may still call for. */
  reviews: number;
  wantsToEnd: boolean;
}

export interface MoveView {
  index: number;
  slot: PlayerSlot;
  track: Track;
  revealed: boolean;
  /** Null until revealed, so nobody can peek at the referee early. */
  verdict: Verdict | null;
  card: CardColor | null;
  /** The opponent answered this song without listening. */
  skipped: boolean;
  songPoints: number | null;
  cardPenalty: number | null;
  review: ReviewView | null;
  createdAt: string;
}

export interface ReviewView {
  slot: PlayerSlot;
  outcome: "upheld" | "overturned" | null;
  reason: LocalizedText | null;
  auto: boolean;
  /** Epoch ms while the window is open, null once it has been settled. */
  deadline: number | null;
}

/**
 * Genres travel as catalogue ids, never as words: the engine has no idea what
 * language the viewer reads, so the browser looks the name up itself.
 */
export type GenreOptionView = string;

export interface CoinView {
  thrownBy: PlayerSlot | null;
  /** Epoch ms the coin went up; the browser animates from here. */
  thrownAt: number | null;
  pickedBy: PlayerSlot | null;
  /** Which side each player ended up with, once somebody called. */
  sides: Record<PlayerSlot, CoinSide> | null;
  /** The landing - null while the coin is still in the air, so nobody can peek. */
  result: CoinSide | null;
  starter: PlayerSlot | null;
  resolvedAt: number | null;
  /** Epoch ms after which the server settles this step itself. */
  deadline: number | null;
  /** The side was called by the server, because nobody called in time. */
  auto: boolean;
}

export interface GenreView {
  options: GenreOptionView[];
  picker: PlayerSlot | null;
  proposed: GenreOptionView | null;
  /** The refusal has been spent. */
  vetoed: boolean;
  locked: GenreOptionView | null;
  deadline: number | null;
  /** The genre was drawn by the server, because nobody named one in time. */
  auto: boolean;
}

export interface ListenView {
  proposed: number | null;
  proposedBy: PlayerSlot | null;
  ratio: number | null;
  deadline: number | null;
  auto: boolean;
}

export interface SetupView {
  coin: CoinView;
  genre: GenreView;
  listen: ListenView;
}

/** A room as one particular viewer is allowed to see it. */
export interface RoomView {
  code: string;
  status: RoomStatus;
  turn: PlayerSlot;
  winner: PlayerSlot | "draw" | null;
  players: PlayerView[];
  moves: MoveView[];
  /** The viewer's seat, or null for spectators and visitors. */
  me: PlayerSlot | null;
  phase: Phase;
  /** Coin and genre. Null once the match is over, or on rooms that predate the setup. */
  setup: SetupView | null;
  /** The genre the opening song had to fit, shown for the whole match. */
  genre: GenreOptionView | null;
  /** Nothing has been played yet, so this player may walk away without losing anything. */
  canCancel: boolean;
  /** Share of a song that must be heard before answering (0.8 in production). */
  listenRatio: number;
  /** Epoch ms after which the server accepts a card call on the pending song. */
  listenUnlockAt: number | null;
  /** Epoch ms by which the player on turn must send a song, or lose by forfeit. */
  turnDeadline: number | null;
  /** Both players have the minimum songs and equal counts, so "Maçı Bitir" can work. */
  canAgreeToEnd: boolean;
  spectatorsAllowed: boolean;
  /** Whether spectators may write in the chat. Players decide; reading is always allowed. */
  spectatorChatAllowed: boolean;
  /** True while the title-similarity stand-in is refereeing, so the room can warn. */
  refereeStandIn: boolean;
  spectatorCount: number;
  endReason: EndReason | null;
  forfeitedBy: PlayerSlot | null;
  bonusAwarded: boolean;
  /** Server time of the last change. Lets the client drop poll responses that arrive late. */
  version: number;
}

export type ChatRole = PlayerSlot | "spectator";

export interface ChatMessageView {
  id: string;
  nickname: string;
  role: ChatRole;
  text: string;
  createdAt: string;
  mine: boolean;
}
