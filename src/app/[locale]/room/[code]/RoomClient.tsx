"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, SessionExpiredError, getJson, postJson } from "@/components/fight/api";
import { CardDecision } from "@/components/fight/CardDecision";
import { ChatPanel } from "@/components/fight/ChatPanel";
import { MatchControls } from "@/components/fight/MatchControls";
import { MatchSetup } from "@/components/fight/MatchSetup";
import { MoveHistory, VerdictCard } from "@/components/fight/MoveHistory";
import { ResultPanel } from "@/components/fight/ResultPanel";
import { Scoreboard } from "@/components/fight/Scoreboard";
import { SendSong } from "@/components/fight/SendSong";
import { SpectatorStage } from "@/components/fight/SpectatorStage";
import { VarReview } from "@/components/fight/VarReview";
import { TurnClock } from "@/components/fight/TurnClock";
import { WaitingRoom } from "@/components/fight/WaitingRoom";
import { YouTubeStage } from "@/components/fight/YouTubeStage";
import { Visualizer, type BurstColor, type VisualizerBurst } from "@/components/Visualizer";
import { useLocale, useUi } from "@/i18n/client";
import { Link, useLocaleRouter } from "@/i18n/link";
import { avatarEmoji, genreLabel } from "@/lib/catalog";
import { WAITING_ROOM_MINUTES } from "@/lib/rules";
import type { ChatMessageView, CoinSide, MoveView, PlayerView, RoomView } from "@/lib/types";

/** How often we ask the server for new moves and chat. */
const POLL_MS = 1500;
/** The coin and the genre are a race, so both sides need to see them land quickly. */
const SETUP_POLL_MS = 700;
/** Chat history kept in the page. */
const MAX_MESSAGES = 200;

/** Picks a colour for whatever just happened between two snapshots of the room. */
function burstFor(previous: RoomView, next: RoomView): BurstColor | null {
  let color: BurstColor | null = null;
  if (next.moves.length > previous.moves.length) color = "volt";
  if (next.setup?.coin.resolvedAt && !previous.setup?.coin.resolvedAt) color = "sun";
  if (next.genre && !previous.genre) color = "volt";

  for (const move of next.moves) {
    if (!move.revealed || previous.moves[move.index]?.revealed) continue;
    if (move.card && move.verdict?.kind === "mismatch") color = move.card === "red" ? "blaze" : "sun";
    else if (move.verdict?.kind === "mismatch") color = "blaze";
    else if (move.verdict?.kind === "match") color = "mint";
  }

  if (next.status === "finished" && previous.status !== "finished") color = "flare";
  return color;
}

interface RoomClientProps {
  initialRoom: RoomView;
  initialMessages: ChatMessageView[];
  initiallyWatching: boolean;
  inviteUrl: string;
}

export default function RoomClient({ initialRoom, initialMessages, initiallyWatching, inviteUrl }: RoomClientProps) {
  const router = useLocaleRouter();
  const ui = useUi();
  const locale = useLocale();
  const [room, setRoom] = useState(initialRoom);
  const [messages, setMessages] = useState(initialMessages);
  const [watching, setWatching] = useState(initiallyWatching);
  const [locked, setLocked] = useState<string | null>(null);
  const [burst, setBurst] = useState<VisualizerBurst | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  /** Index of the pending song this browser has heard enough of. */
  const [listenedMove, setListenedMove] = useState<number | null>(null);
  const roomRef = useRef(initialRoom);
  const lastMessageId = useRef<string | null>(initialMessages.at(-1)?.id ?? null);
  const burstCount = useRef(0);

  const code = room.code;
  const live = room.status === "waiting" || room.status === "active";
  /** Both seats are taken but the coin or the genre is still open. */
  const settingUp = room.status === "active" && room.setup !== null && room.setup.genre.locked === null;

  const applyRoom = useCallback((next: RoomView) => {
    const previous = roomRef.current;
    // A slow poll can land after a newer action response - never step backwards.
    if (next.version < previous.version) return;

    roomRef.current = next;
    setRoom(next);

    const color = burstFor(previous, next);
    if (color) {
      burstCount.current += 1;
      setBurst({ id: burstCount.current, color });
    }
  }, []);

  const addMessages = useCallback((incoming: ChatMessageView[]) => {
    if (incoming.length === 0) return;
    lastMessageId.current = incoming.at(-1)?.id ?? lastMessageId.current;
    setMessages((current) => {
      const known = new Set(current.map((message) => message.id));
      return [...current, ...incoming.filter((message) => !known.has(message.id))].slice(-MAX_MESSAGES);
    });
  }, []);

  /** Session ran out mid-match: log in again and come straight back to this room. */
  const toLogin = useCallback(() => {
    router.push(`/login?next=${encodeURIComponent(`/room/${code}`)}`);
  }, [router, code]);
  const somethingWrong = ui.common.somethingWrong;

  useEffect(() => {
    if (!live || locked) return;

    let cancelled = false;
    const timer = setInterval(async () => {
      const query = new URLSearchParams();
      if (watching) query.set("watch", "1");
      if (lastMessageId.current) query.set("after", lastMessageId.current);

      try {
        const data = await getJson<{ room: RoomView; messages: ChatMessageView[] }>(`/api/rooms/${code}?${query}`);
        if (cancelled) return;
        applyRoom(data.room);
        addMessages(data.messages);
      } catch (err) {
        if (err instanceof SessionExpiredError) toLogin();
        // Players closed the match to spectators while we were watching.
        else if (err instanceof ApiError && err.status === 403) setLocked(err.message);
        // Any other dropped poll is harmless; the next tick catches up.
      }
    }, settingUp ? SETUP_POLL_MS : POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [code, live, locked, watching, settingUp, applyRoom, addMessages, toLogin]);

  const act = useCallback(
    async (path: string, body: unknown): Promise<boolean> => {
      setBusy(true);
      setError(null);
      try {
        const data = await postJson<{ room: RoomView }>(`/api/rooms/${code}/${path}`, body);
        applyRoom(data.room);
        return true;
      } catch (err) {
        if (err instanceof SessionExpiredError) {
          toLogin();
          return false;
        }
        setError(err instanceof Error && err.message ? err.message : somethingWrong);
        return false;
      } finally {
        setBusy(false);
      }
    },
    [code, applyRoom, toLogin, somethingWrong],
  );

  if (locked) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
        <p className="text-5xl">🔒</p>
        <h1 className="mt-4 font-display text-xl font-bold">{locked}</h1>
        <Link href="/lobby" className="btn btn-ghost mt-8">
          {ui.common.backToLobby}
        </Link>
      </main>
    );
  }

  const me = room.players.find((player) => player.slot === room.me) ?? null;
  const opponent = room.players.find((player) => player.slot !== room.me) ?? null;
  const lastMove = room.moves.at(-1) ?? null;
  const pending = lastMove && !lastMove.revealed ? lastMove : null;
  const isSpectator = room.me === null && (watching || room.phase === "spectate");
  // The check rides on the last song and disappears once the next one is sent.
  const review = lastMove?.review ?? null;
  const reviewOwner = review ? room.players.find((player) => player.slot === review.slot) : null;
  const onTurn = room.players.find((player) => player.slot === room.turn);
  const showChat = live && (me !== null || isSpectator);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Link href="/lobby" className="text-sm text-muted hover:text-foreground">
          {ui.room.back}
        </Link>
        <div className="flex items-center gap-2">
          {isSpectator && (
            <span className="rounded-lg bg-accent/15 px-2.5 py-1 text-xs font-semibold text-volt-300">
              {ui.spectator.badge}
            </span>
          )}
          {room.genre && (
            <span className="rounded-lg border border-accent/40 bg-accent/15 px-2.5 py-1 text-xs font-semibold text-volt-200">
              🎼 {genreLabel(room.genre, locale)}
            </span>
          )}
          {live && (
            <span className="rounded-lg border border-line bg-surface-2/60 px-2.5 py-1 text-xs text-ink-200">
              {room.spectatorsAllowed ? ui.spectator.count(room.spectatorCount) : ui.spectator.closed}
            </span>
          )}
          <span className="rounded-lg border border-line bg-surface-2/60 px-3 py-1 font-mono text-xs tracking-[0.3em] text-volt-300">
            {code}
          </span>
        </div>
      </div>

      <Scoreboard room={room} />

      {error && (
        <div
          role="alert"
          className="animate-shake mt-4 flex items-start justify-between gap-3 rounded-xl border border-blaze/40 bg-blaze/10 px-4 py-3 text-sm text-blaze"
        >
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} aria-label={ui.common.close} className="text-lg leading-none">
            ×
          </button>
        </div>
      )}

      {/* minmax(0, …) lets long song titles truncate instead of widening the page on phones. */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {room.status === "active" && onTurn && (
            <TurnClock
              deadline={room.turnDeadline}
              mine={room.turn === room.me}
              label={room.turn === room.me ? ui.clock.mineLabel : ui.clock.theirLabel(onTurn.nickname)}
            />
          )}

          {room.phase === "expired" && (
            <div className="panel p-8 text-center">
              <p className="text-4xl">⌛</p>
              <h2 className="mt-3 font-display text-xl font-bold">{ui.room.expiredTitle}</h2>
              <p className="mt-1 text-sm text-muted">{ui.room.expiredBody(WAITING_ROOM_MINUTES)}</p>
              <Link href="/lobby" className="btn btn-primary mt-6">
                {ui.room.newMatch}
              </Link>
            </div>
          )}

          {room.phase === "join" && !watching && (
            <JoinChoice
              host={room.players[0]}
              spectatorsAllowed={room.spectatorsAllowed}
              busy={busy}
              onJoin={() => void act("join", {})}
              onWatch={() => setWatching(true)}
            />
          )}

          {isSpectator && room.status !== "finished" && !settingUp && <SpectatorStage room={room} burst={burst} />}

          {(room.phase === "coin" || room.phase === "genre" || (isSpectator && settingUp)) && (
            <MatchSetup
              room={room}
              busy={busy}
              onThrow={() => void act("coin", { action: "throw" })}
              onCall={(side: CoinSide) => void act("coin", { action: "call", side })}
              onPropose={(genre) => void act("genre", { action: "propose", genre })}
              onAnswer={(accept) => void act("genre", { action: accept ? "accept" : "veto" })}
            />
          )}

          {room.phase === "waiting" && <WaitingRoom code={code} inviteUrl={inviteUrl} />}

          {review && lastMove && (
            <VarReview
              review={review}
              card={lastMove.card}
              ownerName={reviewOwner?.nickname ?? ""}
              mine={review.slot === room.me}
              reviewsLeft={reviewOwner?.reviews ?? 0}
              busy={busy}
              onRequest={() => void act("review", { action: "request" })}
              onAccept={() => void act("review", { action: "accept" })}
            />
          )}

          {room.phase === "listen" && pending && (
            <>
              <YouTubeStage
                key={pending.index}
                videoId={pending.track.videoId}
                durationSeconds={pending.track.durationSeconds}
                title={pending.track.title}
                caption={ui.opponent.theyPlayed(opponent?.nickname ?? ui.common.opponent)}
                trackListening
                requiredRatio={room.listenRatio}
                storageKey={`mf:listen:${code}:${pending.index}`}
                onListened={() => setListenedMove(pending.index)}
                burst={burst}
              />
              <CardDecision
                listened={listenedMove === pending.index}
                unlockAt={room.listenUnlockAt}
                requiredRatio={room.listenRatio}
                cards={me?.cards ?? { yellow: 0, red: 0 }}
                busy={busy}
                onDecide={(card, skip) => void act("decision", { card, skip })}
              />
            </>
          )}

          {room.phase === "send" && (
            <>
              {lastMove?.revealed && lastMove.slot !== room.me && (
                <VerdictCard
                  move={lastMove}
                  heading={ui.verdict.theirResult(opponent?.nickname ?? ui.common.opponent)}
                />
              )}
              <SendSong
                isOpening={room.moves.length === 0}
                genre={room.genre}
                busy={busy}
                onSend={(url) => act("moves", { url })}
              />
            </>
          )}

          {room.phase === "opponent" && (
            <OpponentTurn
              opponent={opponent}
              pending={pending}
              lastMove={lastMove}
              unlockAt={room.listenUnlockAt}
              burst={burst}
            />
          )}

          {room.phase === "finished" && <ResultPanel room={room} />}
        </div>

        <aside className="space-y-4">
          {me && live && (
            <MatchControls
              room={room}
              me={me}
              opponent={opponent}
              busy={busy}
              onVoteEnd={(value) => void act("end", { wantsToEnd: value })}
              onSurrender={() => void act("surrender", {})}
              onCancel={() => void act("cancel", {})}
              onToggleSpectators={(allowed) => void act("settings", { spectatorsAllowed: allowed })}
              onToggleSpectatorChat={(allowed) => void act("settings", { spectatorChatAllowed: allowed })}
            />
          )}
          {showChat && (
            <ChatPanel
              code={code}
              messages={messages}
              open={live}
              muted={room.me === null && !room.spectatorChatAllowed}
              onMessage={(message) => addMessages([message])}
              onBlocked={(nickname) =>
                setMessages((current) => current.filter((message) => message.nickname !== nickname))
              }
            />
          )}
          <MoveHistory moves={room.moves} players={room.players} me={room.me} />
        </aside>
      </div>
    </main>
  );
}

interface JoinChoiceProps {
  host: PlayerView | undefined;
  spectatorsAllowed: boolean;
  busy: boolean;
  onJoin: () => void;
  onWatch: () => void;
}

function JoinChoice({ host, spectatorsAllowed, busy, onJoin, onWatch }: JoinChoiceProps) {
  const ui = useUi();
  const t = ui.join;
  const name = host?.nickname ?? ui.common.aPlayer;

  return (
    <div className="panel relative overflow-hidden p-8 text-center">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-flare-500/15 to-pulse-500/10" />
      <span className="relative text-5xl">{host ? avatarEmoji(host.avatar) : "🎧"}</span>
      <h2 className="relative mt-4 font-display text-2xl font-black">{t.title(name)}</h2>
      <p className="relative mt-2 text-sm text-ink-300">{t.body}</p>
      <div className="relative mt-6 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onJoin} disabled={busy} className="btn btn-primary px-8 py-4 text-base">
          {busy ? t.joining : t.join}
        </button>
        <button
          type="button"
          onClick={onWatch}
          disabled={busy || !spectatorsAllowed}
          className="btn btn-ghost px-8 py-4 text-base"
        >
          {t.watch}
        </button>
      </div>
      {!spectatorsAllowed && <p className="relative mt-3 text-xs text-muted">{t.closed}</p>}
    </div>
  );
}

interface OpponentTurnProps {
  opponent: PlayerView | null;
  pending: MoveView | null;
  lastMove: MoveView | null;
  unlockAt: number | null;
  burst: VisualizerBurst | null;
}

function OpponentTurn({ opponent, pending, lastMove, unlockAt, burst }: OpponentTurnProps) {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const ui = useUi();
  const t = ui.opponent;
  const name = opponent?.nickname ?? ui.common.opponent;

  // Our song is out and they're listening to it.
  if (pending && unlockAt) {
    const start = new Date(pending.createdAt).getTime();
    const progress = now ? Math.min(1, Math.max(0, (now - start) / Math.max(1, unlockAt - start))) : 0;

    return (
      <div className="panel overflow-hidden">
        <div className="relative h-56">
          <Visualizer playing burst={burst} className="absolute inset-0 h-full w-full" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface to-transparent p-5">
            <p className="eyebrow">{t.turn(name)}</p>
            <p className="mt-1 font-display text-lg font-bold">{t.listening}</p>
          </div>
        </div>
        <div className="border-t border-line/60 p-5">
          <p className="truncate text-sm text-ink-200">{pending.track.title}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-flare-500 to-volt-500 transition-[width] duration-1000"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted">{t.listeningNote}</p>
        </div>
      </div>
    );
  }

  // They've ruled on our song and are picking theirs.
  return (
    <>
      {lastMove?.revealed && <VerdictCard move={lastMove} heading={ui.verdict.myResult} />}
      <div className="panel p-8 text-center">
        <p className="animate-breathe text-4xl">🎚️</p>
        <p className="mt-3 font-display text-lg font-bold">{t.choosing(name)}</p>
        <p className="mt-1 text-sm text-muted">{t.choosingNote}</p>
      </div>
    </>
  );
}
