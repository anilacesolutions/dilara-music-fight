"use client";

import { useEffect, useState } from "react";
import { useLocale, useUi } from "@/i18n/client";
import type { CardColor, ReviewView } from "@/lib/types";

interface VarReviewProps {
  review: ReviewView;
  card: CardColor | null;
  /** The player whose card is being checked, as this viewer sees them. */
  ownerName: string;
  /** True when the card was shown to the person reading this. */
  mine: boolean;
  reviewsLeft: number;
  busy: boolean;
  onRequest: () => void;
  onAccept: () => void;
}

/**
 * The card is on the screen upstairs. Nothing else in the match moves until
 * this is settled, which is the point: a decision worth checking is worth
 * waiting for.
 */
export function VarReview({
  review,
  card,
  ownerName,
  mine,
  reviewsLeft,
  busy,
  onRequest,
  onAccept,
}: VarReviewProps) {
  const t = useUi().var;
  const locale = useLocale();
  const [now, setNow] = useState(0);

  // Starts at 0 so server and client render the same markup; the first tick fills it in.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const open = review.outcome === null;
  const seconds = review.deadline && now ? Math.max(0, Math.ceil((review.deadline - now) / 1000)) : null;
  const overturned = review.outcome === "overturned";
  const cardName = card === "red" ? t.red : t.yellow;

  return (
    <section
      className={`panel animate-rise-in relative overflow-hidden p-5 sm:p-6 ${
        open ? "" : overturned ? "ring-1 ring-mint/40" : "ring-1 ring-blaze/40"
      }`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-volt-500/15 via-transparent to-transparent" />

      <div className="relative flex items-center gap-3">
        <VarMark checking={open && busy} />
        <div className="min-w-0">
          <p className="eyebrow text-volt-300">{t.eyebrow}</p>
          <h2 className="mt-0.5 font-display text-lg font-black sm:text-xl">
            {open ? t.title(cardName, ownerName) : overturned ? t.overturnedTitle : t.upheldTitle}
          </h2>
        </div>
      </div>

      {open ? (
        <>
          <p className="relative mt-3 text-sm text-ink-300">
            {mine ? t.yoursBody(reviewsLeft) : t.theirsBody(ownerName)}
          </p>

          {seconds !== null && (
            <p className="relative mt-2 font-mono text-xs text-muted">{t.countdown(seconds)}</p>
          )}

          {mine && (
            <div className="relative mt-5 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                disabled={busy || reviewsLeft <= 0}
                onClick={onRequest}
                className="btn btn-primary flex-1 py-3"
              >
                {busy ? t.checking : t.request}
              </button>
              <button type="button" disabled={busy} onClick={onAccept} className="btn btn-ghost flex-1 py-3">
                {t.accept}
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          <p className="relative mt-3 text-sm text-ink-200">
            {review.reason ? review.reason[locale] : review.auto ? t.noAnswer : t.noReason}
          </p>
          <p className={`relative mt-3 text-sm font-semibold ${overturned ? "text-mint" : "text-blaze"}`}>
            {overturned ? t.overturnedNote(cardName) : t.upheldNote(cardName)}
          </p>
        </>
      )}
    </section>
  );
}

/** The pitchside monitor every football fan recognises. */
function VarMark({ checking }: { checking: boolean }) {
  return (
    <span
      className={`grid h-12 w-14 shrink-0 place-items-center rounded-lg border-2 border-ink-400 bg-surface-2 ${
        checking ? "animate-breathe" : ""
      }`}
      aria-hidden="true"
    >
      <span className="font-display text-sm font-black tracking-widest text-foreground">VAR</span>
    </span>
  );
}
