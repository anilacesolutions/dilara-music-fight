"use client";

import { useEffect, useState } from "react";
import { useUi } from "@/i18n/client";
import { SCORING } from "@/lib/rules";
import type { CardColor } from "@/lib/types";

const SKIP_COST = -SCORING.skipPenalty;

interface CardDecisionProps {
  /** This browser has heard enough of the song. */
  listened: boolean;
  /** The server's own floor for the same rule, as epoch ms. */
  unlockAt: number | null;
  requiredRatio: number;
  cards: Record<CardColor, number>;
  busy: boolean;
  /** `skip` answers before the listening is done, for SCORING.skipPenalty points. */
  onDecide: (card: CardColor | null, skip: boolean) => void;
}

export function CardDecision({ listened, unlockAt, requiredRatio, cards, busy, onDecide }: CardDecisionProps) {
  const t = useUi().card;
  // Starts at 0 so server and client render the same markup; the first tick fills it in.
  const [now, setNow] = useState(0);
  const [skipping, setSkipping] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, []);

  const percent = Math.round(requiredRatio * 100);
  const serverReady = unlockAt === null || (now > 0 && now >= unlockAt);
  const secondsLeft = unlockAt && now ? Math.max(0, Math.ceil((unlockAt - now) / 1000)) : null;
  const listenedEnough = listened && serverReady;
  // Once the listening is done there is nothing left to skip.
  const skip = skipping && !listenedEnough;
  const canChoose = listenedEnough || skip;

  let status: string;
  if (skip) {
    status = t.skipping(SKIP_COST);
  } else if (!listened) {
    status = t.needListen(percent, SKIP_COST);
  } else if (!serverReady) {
    status = t.preparing(secondsLeft ?? 0);
  } else {
    status = t.ready;
  }

  return (
    <div
      className={`panel p-5 transition sm:p-6 ${skip ? "border-sun/50" : listenedEnough ? "border-accent/50" : ""}`}
    >
      <p className="eyebrow">{t.eyebrow}</p>
      <p className={`mt-2 text-sm ${skip ? "text-sun" : canChoose ? "text-foreground" : "text-ink-300"}`}>{status}</p>

      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        <CardButton
          color="yellow"
          title={t.yellow}
          meaning={t.yellowMeaning}
          left={cards.yellow}
          penalty={SCORING.cardPenalty.yellow}
          leftLabel={t.left}
          disabled={!canChoose || busy || cards.yellow === 0}
          onClick={() => onDecide("yellow", skip)}
        />
        <CardButton
          color="red"
          title={t.red}
          meaning={skip ? t.redSkipMeaning : t.redMeaning}
          left={cards.red}
          penalty={SCORING.cardPenalty.red}
          leftLabel={t.left}
          // A red card needs a full listen; skipping never unlocks it.
          disabled={!listenedEnough || busy || cards.red === 0}
          onClick={() => onDecide("red", false)}
        />
        <button
          type="button"
          disabled={!canChoose || busy}
          onClick={() => onDecide(null, skip)}
          className="flex flex-col items-center justify-center rounded-2xl border border-line bg-surface-2/60 p-3 text-center transition enabled:hover:-translate-y-1 enabled:hover:border-mint disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="text-3xl">✅</span>
          <span className="mt-2 text-sm font-bold">{t.none}</span>
          <span className="text-[11px] text-muted">{t.noneMeaning}</span>
        </button>
      </div>

      {!listenedEnough && (
        <button
          type="button"
          disabled={busy}
          onClick={() => setSkipping((value) => !value)}
          className={
            skipping
              ? "mt-3 w-full rounded-xl px-3 py-2 text-xs text-muted transition hover:text-foreground"
              : "btn mt-3 w-full border border-sun/40 bg-sun/10 text-sun hover:bg-sun/15"
          }
        >
          {skipping ? t.skipCancel : t.skipButton(SKIP_COST)}
        </button>
      )}

      <p className="mt-4 text-xs text-muted">{t.footnote}</p>
    </div>
  );
}

interface CardButtonProps {
  color: CardColor;
  title: string;
  meaning: string;
  left: number;
  penalty: number;
  leftLabel: (left: number, penalty: number) => string;
  disabled: boolean;
  onClick: () => void;
}

function CardButton({ color, title, meaning, left, penalty, leftLabel, disabled, onClick }: CardButtonProps) {
  const face = color === "yellow" ? "bg-sun" : "bg-blaze";
  const hover = color === "yellow" ? "enabled:hover:border-sun" : "enabled:hover:border-blaze";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group flex flex-col items-center rounded-2xl border border-line bg-surface-2/60 p-3 text-center transition enabled:hover:-translate-y-1 ${hover} disabled:cursor-not-allowed disabled:opacity-40`}
    >
      <span
        className={`h-12 w-9 rounded-md shadow-lg transition group-enabled:group-hover:rotate-12 ${face}`}
        aria-hidden="true"
      />
      <span className="mt-2 text-sm font-bold">{title}</span>
      <span className="text-[11px] text-muted">{meaning}</span>
      <span className="mt-1.5 font-mono text-[10px] text-ink-400">{leftLabel(left, penalty)}</span>
    </button>
  );
}
