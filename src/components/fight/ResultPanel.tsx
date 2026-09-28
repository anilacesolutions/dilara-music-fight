"use client";

import { useLocale, useUi } from "@/i18n/client";
import { Link } from "@/i18n/link";
import { avatarEmoji, genreLabel } from "@/lib/catalog";
import { MIN_SONGS_PER_PLAYER, SCORING } from "@/lib/rules";
import type { RoomView } from "@/lib/types";

export function ResultPanel({ room }: { room: RoomView }) {
  const ui = useUi();
  const locale = useLocale();
  const t = ui.result;

  const spectator = room.me === null;
  const draw = room.winner === "draw";
  const won = !draw && room.winner === room.me;
  const nameOf = (slot: string | null) =>
    room.players.find((player) => player.slot === slot)?.nickname ?? ui.common.aPlayer;
  const winner = nameOf(room.winner);
  const loser = nameOf(room.forfeitedBy);
  const iForfeited = room.forfeitedBy !== null && room.forfeitedBy === room.me;

  const cancelled = room.endReason === "cancelled";
  const headline = cancelled
    ? t.cancelled
    : draw
      ? t.draw
      : spectator
        ? t.wonWatching(winner)
        : won
          ? t.won
          : t.lost;

  let reason = "";
  switch (room.endReason) {
    case "cancelled":
      reason = t.reasonCancelled;
      break;
    case "agreement":
      reason = t.reasonAgreement;
      break;
    case "surrender":
      reason = iForfeited ? t.reasonSurrenderMine : t.reasonSurrenderTheirs(loser);
      break;
    case "timeout":
      reason = iForfeited ? t.reasonTimeoutMine : t.reasonTimeoutTheirs(loser);
      break;
    case "cards":
      reason = iForfeited ? t.reasonCardsMine : t.reasonCardsTheirs(loser);
      break;
    case "violation":
      reason = t.reasonViolation(loser);
      break;
  }

  let bonus: string;
  if (cancelled) {
    bonus = t.bonusCancelled;
  } else if (!room.bonusAwarded) {
    bonus = t.bonusNone(MIN_SONGS_PER_PLAYER);
  } else if (draw) {
    bonus = t.bonusDraw(SCORING.drawBonus);
  } else if (won) {
    bonus = t.bonusWon(SCORING.winBonus);
  } else {
    bonus = t.bonusTheirs(winner, SCORING.winBonus);
  }

  const wash = cancelled
    ? "from-ink-700/40"
    : draw || spectator
      ? "from-volt-500/25"
      : won
        ? "from-mint/25"
        : "from-blaze/20";

  return (
    <div className="panel animate-rise-in relative overflow-hidden p-6 text-center sm:p-10">
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent ${wash}`} />
      <p className="eyebrow relative">{cancelled ? t.cancelledEyebrow : t.over}</p>
      <h2 className="relative mt-2 font-display text-3xl font-black sm:text-5xl">{headline}</h2>
      {reason && <p className="relative mt-3 text-sm text-ink-100">{reason}</p>}
      <p className="relative mt-1 text-sm text-ink-300">{bonus}</p>

      <div className="relative mx-auto mt-8 grid max-w-md grid-cols-2 gap-3">
        {room.players.map((player) => (
          <div
            key={player.slot}
            className={`rounded-2xl border p-4 ${player.slot === room.winner ? "border-mint/50 bg-mint/10" : "border-line bg-surface-2/60"}`}
          >
            <p className="text-3xl">{avatarEmoji(player.avatar)}</p>
            <p className={`mt-2 truncate text-sm font-bold ${player.slot === "a" ? "text-player-a" : "text-player-b"}`}>
              {player.nickname}
            </p>
            <p className="font-display text-3xl font-black tabular-nums">{player.score}</p>
          </div>
        ))}
      </div>

      <p className="relative mt-4 text-xs text-muted">
        {t.songCount(room.moves.length)}
        {room.genre && t.withGenre(genreLabel(room.genre, locale))}
      </p>

      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/lobby" className="btn btn-primary px-6">
          {spectator ? t.backToLobby : t.newMatch}
        </Link>
        <Link href="/#liderler" className="btn btn-ghost px-6">
          {t.leaderboard}
        </Link>
      </div>
    </div>
  );
}
