"use client";

import { useState } from "react";
import { useUi } from "@/i18n/client";
import { MIN_SONGS_PER_PLAYER, SCORING } from "@/lib/rules";
import type { PlayerView, RoomView } from "@/lib/types";

interface MatchControlsProps {
  room: RoomView;
  me: PlayerView;
  opponent: PlayerView | null;
  busy: boolean;
  onVoteEnd: (wantsToEnd: boolean) => void;
  onSurrender: () => void;
  /** Walk away before the first song, with nothing scored either way. */
  onCancel: () => void;
  onToggleSpectators: (allowed: boolean) => void;
}

export function MatchControls({
  room,
  me,
  opponent,
  busy,
  onVoteEnd,
  onSurrender,
  onCancel,
  onToggleSpectators,
}: MatchControlsProps) {
  const [confirming, setConfirming] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const ui = useUi();
  const t = ui.controls;
  // Before the first song there is no match to end or lose - only one to leave.
  const active = room.status === "active" && !room.canCancel;

  const mySongs = room.moves.filter((move) => move.slot === me.slot).length;
  const theirSongs = room.moves.filter((move) => move.slot !== me.slot).length;
  const opponentName = opponent?.nickname ?? ui.common.opponent;
  const bothPastMinimum = mySongs >= MIN_SONGS_PER_PLAYER && theirSongs >= MIN_SONGS_PER_PLAYER;

  let voteNote: string;
  if (!room.canAgreeToEnd && !me.wantsToEnd) {
    voteNote = t.needEqual(MIN_SONGS_PER_PLAYER, mySongs, opponentName, theirSongs);
  } else if (me.wantsToEnd && !opponent?.wantsToEnd) {
    voteNote = t.waitingForThem(opponentName);
  } else if (!me.wantsToEnd && opponent?.wantsToEnd) {
    voteNote = t.theyWant(opponentName);
  } else {
    voteNote = t.bothMustPress;
  }

  return (
    <section className="panel space-y-4 p-4">
      {active && (
        <div>
          <button
            type="button"
            disabled={busy || (!room.canAgreeToEnd && !me.wantsToEnd)}
            onClick={() => onVoteEnd(!me.wantsToEnd)}
            className={`btn w-full ${me.wantsToEnd ? "border border-accent/50 bg-accent/15 text-volt-200" : "btn-ghost"}`}
          >
            {me.wantsToEnd ? t.withdrawEnd : t.endMatch}
          </button>
          <p className="mt-2 text-center text-xs text-muted">{voteNote}</p>
        </div>
      )}

      {active &&
        (confirming ? (
          <div className="rounded-xl border border-blaze/40 bg-blaze/10 p-3 text-center">
            <p className="text-sm text-blaze">{t.surrenderWarning}</p>
            <p className="mt-1 text-[11px] text-ink-300">
              {bothPastMinimum
                ? t.surrenderBonus(opponentName, SCORING.winBonus)
                : t.surrenderNoBonus(MIN_SONGS_PER_PLAYER)}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setConfirming(false);
                  onSurrender();
                }}
                className="btn flex-1 bg-blaze px-3 py-2 text-background"
              >
                {t.surrenderConfirm}
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="btn btn-ghost flex-1 px-3 py-2">
                {ui.common.cancel}
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            disabled={busy}
            onClick={() => setConfirming(true)}
            className="w-full rounded-xl px-3 py-2 text-xs text-muted transition hover:bg-blaze/10 hover:text-blaze"
          >
            {t.surrender}
          </button>
        ))}

      {room.canCancel &&
        (leaving ? (
          <div className="rounded-xl border border-line bg-surface-2/60 p-3 text-center">
            <p className="text-sm">{t.leaveQuestion}</p>
            <p className="mt-1 text-[11px] text-ink-300">{t.leaveNote}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => {
                  setLeaving(false);
                  onCancel();
                }}
                className="btn btn-ghost flex-1 px-3 py-2"
              >
                {t.leaveConfirm}
              </button>
              <button type="button" onClick={() => setLeaving(false)} className="btn btn-ghost flex-1 px-3 py-2">
                {ui.common.cancel}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button
              type="button"
              disabled={busy}
              onClick={() => setLeaving(true)}
              className="btn btn-ghost w-full"
            >
              {t.leave}
            </button>
            <p className="mt-2 text-center text-xs text-muted">{t.leaveHint}</p>
          </div>
        ))}

      <label className="flex cursor-pointer items-center justify-between gap-3 border-t border-line/60 pt-3 text-sm">
        <span>
          <span className="font-semibold">{t.spectatorsOn}</span>
          <span className="block text-[11px] text-muted">{t.spectatorsHint}</span>
        </span>
        <input
          type="checkbox"
          checked={room.spectatorsAllowed}
          disabled={busy}
          onChange={(event) => onToggleSpectators(event.target.checked)}
          className="h-5 w-5 shrink-0 accent-volt-500"
        />
      </label>
    </section>
  );
}
