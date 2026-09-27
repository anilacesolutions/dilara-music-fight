import type { Metadata } from "next";
import { LeaderboardPanel } from "@/components/LeaderboardPanel";
import { JoinByCode } from "@/components/lobby/JoinByCode";
import { StartFightDialog } from "@/components/lobby/StartFightDialog";
import { Link } from "@/i18n/link";
import { getSite } from "@/i18n/server";
import { requireUser } from "@/lib/auth";
import { avatarEmoji } from "@/lib/catalog";
import { getLeaderboard } from "@/lib/leaderboard";
import { CARDS_PER_PLAYER, MIN_SONGS_PER_PLAYER, TURN_SECONDS } from "@/lib/rules";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getSite()).meta.lobby };
}

export default async function LobbyPage() {
  const user = await requireUser("/lobby");
  const [weekly, site] = await Promise.all([getLeaderboard("weekly"), getSite()]);
  const t = site.lobbyPage;

  const banners = t.banners({
    yellow: CARDS_PER_PLAYER.yellow,
    red: CARDS_PER_PLAYER.red,
    minSongs: MIN_SONGS_PER_PLAYER,
    turnMinutes: TURN_SECONDS / 60,
  });

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:py-12">
      <section className="panel relative overflow-hidden p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-flare-500/15 via-transparent to-pulse-500/15" />
        <div className="relative flex flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <span className="animate-float grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-surface-2 text-5xl ring-1 ring-line">
              {avatarEmoji(user.avatar)}
            </span>
            <div>
              <p className="eyebrow">{t.eyebrow}</p>
              <h1 className="mt-1 font-display text-2xl font-black sm:text-4xl">
                {t.welcome} <span className="text-gradient">{user.nickname}</span>
              </h1>
              <p className="mt-2 text-sm text-ink-300">{t.points(user.totalPoints)}</p>
            </div>
          </div>
          <StartFightDialog />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <JoinByCode />

          <div className="grid gap-4 sm:grid-cols-2">
            {banners.map((banner, index) => {
              const content = (
                <>
                  <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent ${banner.tone}`} />
                  <span className="relative text-3xl">{banner.icon}</span>
                  <h2 className="relative mt-3 font-display text-base font-bold">{banner.title}</h2>
                  <p className="relative mt-1.5 text-sm leading-relaxed text-ink-300">{banner.body}</p>
                </>
              );

              // The last banner is the only one that goes anywhere: the player's own profile.
              return index === banners.length - 1 ? (
                <Link
                  key={banner.title}
                  href={`/profile/${user.nickname}`}
                  className="panel relative overflow-hidden p-5 transition hover:-translate-y-0.5 hover:border-accent/60"
                >
                  {content}
                </Link>
              ) : (
                <article key={banner.title} className="panel relative overflow-hidden p-5">
                  {content}
                </article>
              );
            })}
          </div>
        </div>

        <LeaderboardPanel title={t.weeklyTitle} subtitle={t.weeklySubtitle} entries={weekly} tone="volt" />
      </div>
    </main>
  );
}
