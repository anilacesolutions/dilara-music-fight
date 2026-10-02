"use client";

import { useEffect, useState } from "react";
import { useUi } from "@/i18n/client";
import { LISTEN_RATIO_STEPS } from "@/lib/rules";
import type { ListenView, PlayerSlot, PlayerView } from "@/lib/types";

interface ListenPickProps {
  listen: ListenView;
  /** Null for spectators. */
  me: PlayerSlot | null;
  players: PlayerView[];
  busy: boolean;
  onPropose: (ratio: number) => void;
  onAccept: () => void;
}

const STEPS: number[] = [...LISTEN_RATIO_STEPS];
const DEFAULT_INDEX = STEPS.indexOf(0.6);
const percent = (ratio: number) => Math.round(ratio * 100);

/**
 * The last thing settled before the first song: how much of each track has to
 * be heard. Testers disliked having 80% imposed on them, so the pair choose it
 * together - either may put a share forward, and it only counts once the other
 * agrees. The slider starts where the match would land if they said nothing.
 */
export function ListenPick({ listen, me, players, busy, onPropose, onAccept }: ListenPickProps) {
  const ui = useUi();
  const t = ui.listenRule;

  const [index, setIndex] = useState(DEFAULT_INDEX);
  const [now, setNow] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // The slider follows whatever is on the table, so a counter-offer is visible
  // the moment it lands. Adjusted during render rather than in an effect, which
  // would show the old share for one frame.
  const proposed = listen.proposed;
  const [seen, setSeen] = useState<number | null>(proposed);
  if (proposed !== seen) {
    setSeen(proposed);
    const at = proposed === null ? -1 : STEPS.indexOf(proposed);
    setIndex(at >= 0 ? at : DEFAULT_INDEX);
  }

  const nameOf = (slot: PlayerSlot | null) =>
    players.find((player) => player.slot === slot)?.nickname ?? ui.common.opponent;

  const mine = proposed !== null && listen.proposedBy === me;
  const theirs = proposed !== null && me !== null && listen.proposedBy !== me;
  const secondsLeft = listen.deadline && now ? Math.max(0, Math.ceil((listen.deadline - now) / 1000)) : null;
  const chosen = STEPS[index];

  let heading: string;
  let note: string;
  if (theirs) {
    heading = t.theirProposal(nameOf(listen.proposedBy), percent(proposed));
    note = t.answerNote;
  } else if (mine) {
    heading = t.myProposal(percent(proposed));
    note = t.waitingNote(nameOf(listen.proposedBy === "a" ? "b" : "a"));
  } else if (me === null) {
    heading = t.watchingTitle;
    note = t.watchingNote;
  } else {
    heading = t.title;
    note = t.note(percent(STEPS[DEFAULT_INDEX]));
  }

  return (
    <section className="panel animate-rise-in p-5 sm:p-6">
      <p className="eyebrow text-volt-300">{t.eyebrow}</p>
      <h2 className="mt-1 font-display text-xl font-black sm:text-2xl">{heading}</h2>
      <p className="mt-1.5 text-sm text-ink-300">{note}</p>

      <div className="mt-6">
        <div className="flex items-baseline justify-between">
          <span className="font-display text-4xl font-black tabular-nums text-volt-200">{percent(chosen)}%</span>
          <span className="text-xs text-muted">{describe(chosen, t)}</span>
        </div>

        <input
          type="range"
          min={0}
          max={STEPS.length - 1}
          step={1}
          value={index}
          disabled={me === null || busy}
          onChange={(event) => setIndex(Number(event.target.value))}
          aria-label={t.sliderLabel}
          aria-valuetext={`${percent(chosen)}%`}
          className="mt-3 w-full accent-volt-400"
        />

        <div className="mt-1 flex justify-between text-[10px] tabular-nums text-muted">
          {STEPS.map((step) => (
            <span key={step}>{percent(step)}</span>
          ))}
        </div>
      </div>

      {secondsLeft !== null && (
        <p className="mt-4 font-mono text-xs text-muted">{t.countdown(secondsLeft)}</p>
      )}

      {me !== null && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          {theirs && chosen === proposed ? (
            <button type="button" disabled={busy} onClick={onAccept} className="btn btn-primary flex-1 py-3">
              {t.accept(percent(proposed))}
            </button>
          ) : (
            <button
              type="button"
              disabled={busy || (mine && chosen === proposed)}
              onClick={() => onPropose(chosen)}
              className="btn btn-primary flex-1 py-3"
            >
              {theirs ? t.counter(percent(chosen)) : t.propose(percent(chosen))}
            </button>
          )}
        </div>
      )}
    </section>
  );
}

/** The two ends need saying out loud: they change the game, not just a number. */
function describe(ratio: number, t: ReturnType<typeof useUi>["listenRule"]): string {
  if (ratio === 0) return t.noneHint;
  if (ratio === 1) return t.allHint;
  return t.someHint;
}
