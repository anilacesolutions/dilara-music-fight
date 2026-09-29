import type { Metadata } from "next";
import { Link } from "@/i18n/link";
import { getSite } from "@/i18n/server";
import { CARDS_PER_PLAYER } from "@/lib/rules";
import {
  MAX_TRACK_SECONDS,
  MIN_SIGNUP_AGE,
  MIN_SIGNUP_GENRES,
  MIN_SONGS_PER_PLAYER,
  REVIEW_SECONDS,
  SCORING,
  SETUP_SECONDS,
  TURN_SECONDS,
  listenRatio,
} from "@/lib/rules";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getSite()).help.title };
}

/**
 * Plain <details> elements: the accordion opens without a line of JavaScript,
 * keyboards and screen readers already know them, and a phone with a slow
 * connection gets a working page before anything else has loaded.
 */
export default async function HelpPage() {
  const t = (await getSite()).help;
  const percent = Math.round(listenRatio() * 100);

  const questions: { q: string; a: string }[] = [
    { q: t.playQ, a: t.playA },
    { q: t.signupQ, a: t.signupA(MIN_SIGNUP_GENRES, MIN_SIGNUP_AGE) },
    { q: t.startQ, a: t.startA },
    { q: t.coinQ, a: t.coinA(SETUP_SECONDS) },
    { q: t.genreQ, a: t.genreA },
    { q: t.sendQ, a: t.sendA(MAX_TRACK_SECONDS / 60) },
    { q: t.listenQ, a: t.listenA(percent) },
    { q: t.skipQ, a: t.skipA(SCORING.skipPenalty) },
    {
      q: t.cardsQ,
      a: t.cardsA(CARDS_PER_PLAYER.yellow, SCORING.cardPenalty.yellow, SCORING.cardPenalty.red),
    },
    { q: t.refereeQ, a: t.refereeA },
    { q: t.varQ, a: t.varA(REVIEW_SECONDS) },
    {
      q: t.scoringQ,
      a: t.scoringA(SCORING.match, SCORING.mismatch, SCORING.winBonus, SCORING.drawBonus, MIN_SONGS_PER_PLAYER),
    },
    { q: t.endQ, a: t.endA(MIN_SONGS_PER_PLAYER, TURN_SECONDS / 60) },
    { q: t.chatQ, a: t.chatA },
    { q: t.spectatorQ, a: t.spectatorA },
  ];

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
      <h1 className="font-display text-3xl font-black sm:text-4xl">{t.title}</h1>
      <p className="mt-2 text-sm text-ink-300">{t.intro}</p>

      <div className="mt-8 space-y-2">
        {questions.map(({ q, a }) => (
          <details key={q} className="panel group overflow-hidden p-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-semibold transition hover:bg-surface-2/50 sm:text-base">
              {q}
              <span className="shrink-0 text-lg text-muted transition group-open:rotate-45" aria-hidden="true">
                +
              </span>
            </summary>
            <p className="border-t border-line/60 px-5 py-4 text-sm leading-relaxed text-ink-200">{a}</p>
          </details>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-muted">
        {t.stillStuck}{" "}
        <Link href="/contact" className="text-volt-300 underline-offset-4 hover:underline">
          {t.stillStuckLink}
        </Link>
      </p>
    </main>
  );
}
