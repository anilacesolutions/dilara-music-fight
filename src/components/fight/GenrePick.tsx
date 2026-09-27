"use client";

import { useEffect, useState } from "react";
import { useLocale, useUi } from "@/i18n/client";
import { genreLabel } from "@/lib/catalog";
import { SCORING } from "@/lib/rules";
import type { GenreView, PlayerSlot, PlayerView } from "@/lib/types";

interface GenrePickProps {
  genre: GenreView;
  /** Null for spectators. */
  me: PlayerSlot | null;
  /** Who won the toss and opens the match. */
  starter: PlayerSlot | null;
  players: PlayerView[];
  busy: boolean;
  onPropose: (genre: string) => void;
  onAnswer: (accept: boolean) => void;
}

export function GenrePick({ genre, me, starter, players, busy, onPropose, onAnswer }: GenrePickProps) {
  const ui = useUi();
  const locale = useLocale();
  const t = ui.genre;

  const [now, setNow] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nameOf = (slot: PlayerSlot | null) =>
    players.find((player) => player.slot === slot)?.nickname ?? ui.common.opponent;
  const picker = genre.picker;
  const iPick = me !== null && picker === me;
  const iAnswer = me !== null && picker !== null && picker !== me;
  const secondsLeft = genre.deadline && now ? Math.max(0, Math.ceil((genre.deadline - now) / 1000)) : null;
  const proposedLabel = genre.proposed ? genreLabel(genre.proposed, locale) : null;

  let heading: string;
  let note: string;
  if (proposedLabel) {
    heading = iAnswer ? t.proposedToMe(nameOf(picker), proposedLabel) : t.proposedTitle(proposedLabel);
    note = iAnswer ? t.answerNote : iPick ? t.waitingNote(nameOf(starter)) : t.watchingProposal(nameOf(starter));
  } else if (iPick) {
    heading = t.myTurnTitle;
    note = genre.vetoed ? t.pickAfterVeto : t.pickNote(nameOf(starter));
  } else {
    heading = t.theirTurnTitle(nameOf(picker));
    note = genre.vetoed ? t.watchingAfterVeto : t.watchingNote;
  }

  return (
    <section className="panel p-5 sm:p-6">
      <p className="eyebrow">{t.eyebrow}</p>
      <h2 className="mt-1 font-display text-xl font-black sm:text-2xl">{heading}</h2>
      <p className="mt-1.5 text-sm text-ink-300">{note}</p>

      {iPick && !genre.proposed ? (
        <div className="mt-5 flex flex-wrap gap-2">
          {genre.options.map((option) => (
            <button
              key={option}
              type="button"
              disabled={busy}
              onClick={() => onPropose(option)}
              className="btn btn-ghost px-4 py-2.5 text-sm enabled:hover:-translate-y-0.5 enabled:hover:border-accent"
            >
              {genreLabel(option, locale)}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {genre.options.map((option) => (
            <span
              key={option}
              className={`rounded-xl border px-4 py-2.5 text-sm ${
                genre.proposed === option
                  ? "border-accent bg-accent/15 font-bold text-volt-200"
                  : "border-line text-muted"
              }`}
            >
              {genreLabel(option, locale)}
            </span>
          ))}
        </div>
      )}

      {iAnswer && genre.proposed && (
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" disabled={busy} onClick={() => onAnswer(true)} className="btn btn-primary px-6 py-3">
            {t.accept}
          </button>
          <button
            type="button"
            disabled={busy || genre.vetoed}
            onClick={() => onAnswer(false)}
            className="btn btn-ghost px-6 py-3"
          >
            {t.veto}
          </button>
        </div>
      )}

      <p className="mt-5 border-t border-line/60 pt-4 text-xs text-muted">
        {t.scoring(SCORING.match, SCORING.mismatch)}
        {secondsLeft !== null && t.deadline(secondsLeft)}
      </p>
    </section>
  );
}
