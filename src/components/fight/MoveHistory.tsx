"use client";

import Image from "next/image";
import { useLocale, useUi } from "@/i18n/client";
import { formatDuration, formatPoints } from "@/lib/format";
import { SCORING } from "@/lib/rules";
import type { MoveView, PlayerSlot, PlayerView } from "@/lib/types";

function trackLabel(move: MoveView): string {
  return move.track.artist && move.track.song ? `${move.track.artist} — ${move.track.song}` : move.track.title;
}

interface MoveHistoryProps {
  moves: MoveView[];
  players: PlayerView[];
  me: PlayerSlot | null;
}

export function MoveHistory({ moves, players, me }: MoveHistoryProps) {
  const ui = useUi();
  const t = ui.history;

  return (
    <section className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-bold">{t.title}</h2>
        <span className="font-mono text-xs text-muted">{moves.length}</span>
      </div>

      {moves.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">{t.empty}</p>
      ) : (
        <ol className="space-y-2">
          {[...moves].reverse().map((move) => {
            const player = players.find((candidate) => candidate.slot === move.slot);
            const total = (move.songPoints ?? 0) + (move.cardPenalty ?? 0);
            const verdictTone =
              move.verdict?.kind === "mismatch"
                ? "border-blaze/40 bg-blaze/10 text-blaze"
                : move.verdict?.kind === "match"
                  ? "border-mint/40 bg-mint/10 text-mint"
                  : "border-line text-muted";

            return (
              <li key={move.index} className="flex gap-3 rounded-xl p-2 transition hover:bg-surface-2/60">
                <Image
                  src={`https://i.ytimg.com/vi/${move.track.videoId}/mqdefault.jpg`}
                  alt=""
                  width={80}
                  height={45}
                  unoptimized
                  className="h-[45px] w-20 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <span className={`font-bold ${move.slot === "a" ? "text-player-a" : "text-player-b"}`}>
                      {player?.nickname ?? move.slot}
                      {move.slot === me && ` (${ui.common.you})`}
                    </span>
                    <span className="text-muted">· {formatDuration(move.track.durationSeconds)}</span>
                  </div>
                  <a
                    href={move.track.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block truncate text-sm font-medium hover:underline"
                  >
                    {trackLabel(move)}
                  </a>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    {move.revealed ? (
                      <span className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${verdictTone}`}>
                        {formatPoints(total)}
                      </span>
                    ) : (
                      <span className="rounded border border-line px-1.5 py-0.5 text-[10px] text-muted">
                        {t.sealed}
                      </span>
                    )}
                    {move.card && (
                      <span
                        className={`h-3.5 w-2.5 rounded-[2px] ${move.card === "red" ? "bg-blaze" : "bg-sun"}`}
                        title={move.card === "red" ? t.redTitle : t.yellowTitle}
                      />
                    )}
                    {move.skipped && (
                      <span
                        className="rounded border border-sun/40 bg-sun/10 px-1.5 py-0.5 text-[10px] text-sun"
                        title={t.skippedTitle(SCORING.skipPenalty)}
                      >
                        {t.skipped}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/** The reveal: what the referee said, what the card did, and what it cost. */
export function VerdictCard({ move, heading }: { move: MoveView; heading: string }) {
  const t = useUi().verdict;
  const locale = useLocale();
  const verdict = move.verdict;
  if (!verdict) return null;

  const cardPenalty = move.cardPenalty ?? 0;
  const total = (move.songPoints ?? 0) + cardPenalty;
  const tone =
    verdict.kind === "mismatch"
      ? { wash: "from-blaze/25", badge: "text-blaze", label: t.mismatch }
      : { wash: "from-mint/20", badge: "text-mint", label: t.match };

  let cardLine: string;
  if (move.card) {
    const name = move.card === "red" ? t.red : t.yellow;
    cardLine = cardPenalty !== 0 ? t.cardUpheld(name, cardPenalty) : t.cardWasted(name);
  } else {
    cardLine = t.noCard;
  }

  return (
    <div
      className={`panel animate-flip-in relative overflow-hidden p-5 ${verdict.kind === "mismatch" ? "animate-shake" : ""}`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent ${tone.wash}`} />
      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="eyebrow">{heading}</p>
          <p className="mt-1 truncate text-sm font-semibold">{trackLabel(move)}</p>
          <p className={`mt-2 font-display text-base font-bold ${tone.badge}`}>{tone.label}</p>
          <p className="mt-1 text-sm text-ink-200">{verdict.reason[locale]}</p>
          <p className="mt-2 text-xs text-muted">{cardLine}</p>
          {move.skipped && <p className="mt-1 text-xs text-sun">{t.skipped(SCORING.skipPenalty)}</p>}
        </div>
        <span className={`shrink-0 font-display text-3xl font-black tabular-nums ${tone.badge}`}>
          {formatPoints(total)}
        </span>
      </div>
      {move.track.genre && (
        <span className="relative mt-3 inline-block rounded-full border border-line px-2.5 py-1 text-[11px] text-muted">
          {move.track.genre}
        </span>
      )}
    </div>
  );
}
