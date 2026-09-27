import { FightPreview } from "@/components/FightPreview";
import { LeaderboardPanel } from "@/components/LeaderboardPanel";
import { Visualizer } from "@/components/Visualizer";
import { Link } from "@/i18n/link";
import { currentLocale, getSite } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { GENRES, genreLabel } from "@/lib/catalog";
import { getLeaderboards } from "@/lib/leaderboard";
import {
  CARDS_PER_PLAYER,
  MAX_TRACK_SECONDS,
  MIN_SIGNUP_AGE,
  MIN_SIGNUP_GENRES,
  MIN_SONGS_PER_PLAYER,
  SCORING,
  TURN_SECONDS,
  WAITING_ROOM_MINUTES,
  listenRatio,
} from "@/lib/rules";

export default async function HomePage() {
  const [user, boards, site, locale] = await Promise.all([
    getCurrentUser(),
    getLeaderboards(),
    getSite(),
    currentLocale(),
  ]);

  const t = site.landing;
  const percent = Math.round(listenRatio() * 100);

  const steps = t.steps({
    minGenres: MIN_SIGNUP_GENRES,
    skipCost: SCORING.skipPenalty,
    minSongs: MIN_SONGS_PER_PLAYER,
    percent,
  });
  const scoreRows = t.scoreRows({
    match: SCORING.match,
    mismatch: SCORING.mismatch,
    yellow: SCORING.cardPenalty.yellow,
    red: SCORING.cardPenalty.red,
    skip: SCORING.skipPenalty,
    win: SCORING.winBonus,
    draw: SCORING.drawBonus,
    ai: SCORING.aiMultiplier * 100,
  });
  const ruleGroups = t.rules({
    yellow: CARDS_PER_PLAYER.yellow,
    red: CARDS_PER_PLAYER.red,
    skipCost: SCORING.skipPenalty,
    maxMinutes: MAX_TRACK_SECONDS / 60,
    aiPercent: SCORING.aiMultiplier * 100,
    minAge: MIN_SIGNUP_AGE,
    minSongs: MIN_SONGS_PER_PLAYER,
    turnMinutes: TURN_SECONDS / 60,
    waitingMinutes: WAITING_ROOM_MINUTES,
    percent,
  });

  return (
    <main className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-16 pt-10 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
        <div className="animate-rise-in">
          <p className="eyebrow mb-4">{t.heroEyebrow}</p>
          <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            {t.heroTitleTop}
            <br />
            <span className="text-gradient">{t.heroTitleBottom}</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-200 sm:text-lg">{t.heroBody}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            {user ? (
              <Link href="/lobby" className="btn btn-primary px-6 py-3.5 text-base">
                {t.toLobby}
              </Link>
            ) : (
              <>
                <Link href="/signup" className="btn btn-primary px-6 py-3.5 text-base">
                  {t.signupNow}
                </Link>
                <Link href="/login" className="btn btn-ghost px-6 py-3.5 text-base">
                  {t.login}
                </Link>
              </>
            )}
          </div>

          <ul className="mt-8 flex flex-wrap gap-2 text-xs text-ink-200">
            {t.chips(percent).map((chip) => (
              <li key={chip} className="rounded-full border border-line bg-surface/60 px-3 py-1.5">
                {chip}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex min-h-[440px] items-center justify-center">
          <Visualizer
            playing
            className="pointer-events-none absolute inset-x-0 -top-16 h-[calc(100%+8rem)] w-full opacity-90"
          />
          <FightPreview />
        </div>
      </section>

      {/* Genre ticker */}
      <div className="relative overflow-hidden border-y border-line/50 bg-surface/40 py-3" aria-hidden="true">
        <div className="animate-marquee flex w-max gap-8 whitespace-nowrap font-display text-sm text-ink-400">
          {[...GENRES, ...GENRES].map((genre, index) => (
            <span key={index}>
              {genreLabel(genre.id, locale)} <span className="text-accent">✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* What it is */}
      <section className="mx-auto w-full max-w-6xl px-4 py-20">
        <p className="eyebrow">{t.whatEyebrow}</p>
        <h2 className="mt-3 max-w-2xl font-display text-2xl font-bold sm:text-4xl">{t.whatTitle}</h2>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {t.pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="panel group p-6 transition duration-300 hover:-translate-y-1 hover:border-accent/60"
            >
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-2 text-2xl transition group-hover:scale-110">
                {pillar.icon}
              </span>
              <h3 className="mt-5 font-display text-lg font-bold">{pillar.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* After signing up */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20">
        <p className="eyebrow">{t.stepsEyebrow}</p>
        <h2 className="mt-3 font-display text-2xl font-bold sm:text-4xl">{t.stepsTitle}</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {steps.map((step, index) => (
            <li key={step.title} className="panel relative overflow-hidden p-6">
              <span className="pointer-events-none absolute -right-2 -top-6 font-display text-8xl font-black text-ink-800">
                {index + 1}
              </span>
              <h3 className="relative font-display text-base font-bold">{step.title}</h3>
              <p className="relative mt-2 text-sm leading-relaxed text-ink-300">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Scoring and rules */}
      <section className="mx-auto grid w-full max-w-6xl gap-4 px-4 pb-20 lg:grid-cols-2">
        <div className="panel p-6 sm:p-8">
          <p className="eyebrow">{t.scoreEyebrow}</p>
          <h2 className="mt-3 font-display text-xl font-bold sm:text-2xl">{t.scoreTitle}</h2>
          <dl className="mt-6 divide-y divide-line/60">
            {scoreRows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 py-3">
                <dt className="text-sm text-ink-200">{row.label}</dt>
                <dd className={`font-mono text-lg font-bold tabular-nums ${row.tone}`}>{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-xs text-muted">{t.scoreNote(MIN_SONGS_PER_PLAYER)}</p>
        </div>

        {ruleGroups.map((group) => (
          <div key={group.eyebrow} className="panel p-6 sm:p-8">
            <p className="eyebrow">{group.eyebrow}</p>
            <h2 className="mt-3 font-display text-xl font-bold sm:text-2xl">{group.title}</h2>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-ink-200">
              {group.items.map((item) => (
                <li key={item.text} className="flex gap-3">
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Leaderboards */}
      <section id="liderler" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-20">
        <p className="eyebrow">{t.leaderEyebrow}</p>
        <h2 className="mt-3 font-display text-2xl font-bold sm:text-4xl">{t.leaderTitle}</h2>
        <p className="mt-2 text-sm text-muted">{t.leaderNote}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <LeaderboardPanel title={t.dailyTitle} subtitle={t.dailySubtitle} entries={boards.daily} tone="flare" />
          <LeaderboardPanel title={t.weeklyTitle} subtitle={t.weeklySubtitle} entries={boards.weekly} tone="volt" />
          <LeaderboardPanel title={t.monthlyTitle} subtitle={t.monthlySubtitle} entries={boards.monthly} tone="pulse" />
        </div>
      </section>

      {/* Closing call */}
      {!user && (
        <section className="mx-auto w-full max-w-6xl px-4 pb-24">
          <div className="panel relative overflow-hidden p-8 text-center sm:p-12">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-flare-500/15 via-volt-500/10 to-pulse-500/15" />
            <h2 className="relative font-display text-2xl font-black sm:text-4xl">{t.ctaTitle}</h2>
            <p className="relative mx-auto mt-3 max-w-lg text-sm text-ink-200">{t.ctaBody}</p>
            <Link href="/signup" className="btn btn-primary relative mt-8 px-8 py-4 text-base">
              {t.ctaButton}
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}
