import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { unblock } from "@/app/actions/profile";
import { ProfileEditor } from "@/components/profile/ProfileEditor";
import { currentLocale, getLocaleTag, getSite } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { avatarEmoji, genreLabel } from "@/lib/catalog";
import { getPublicProfile, listBlockedNicknames } from "@/lib/users";

export async function generateMetadata({ params }: PageProps<"/[locale]/profile/[nickname]">): Promise<Metadata> {
  const { nickname } = await params;
  return { title: decodeURIComponent(nickname) };
}

export default async function ProfilePage({ params }: PageProps<"/[locale]/profile/[nickname]">) {
  const { nickname } = await params;
  const [profile, viewer, site, locale, localeTag] = await Promise.all([
    getPublicProfile(decodeURIComponent(nickname)),
    getCurrentUser(),
    getSite(),
    currentLocale(),
    getLocaleTag(),
  ]);
  if (!profile) notFound();

  const t = site.profilePage;
  const isOwner = viewer?.nickname.toLowerCase() === profile.nickname.toLowerCase();
  const blocked = isOwner && viewer ? await listBlockedNicknames(viewer.id) : [];
  const memberSince = new Intl.DateTimeFormat(localeTag, {
    month: "long",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).format(profile.memberSince);

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:py-12">
      <section className="panel relative overflow-hidden p-6 sm:p-10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-volt-500/20 via-transparent to-flare-500/10" />
        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <span className="animate-float grid h-28 w-28 shrink-0 place-items-center rounded-3xl bg-surface-2 text-6xl ring-1 ring-line">
            {avatarEmoji(profile.avatar)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">{t.eyebrow}</p>
            <h1 className="mt-1 truncate font-display text-3xl font-black sm:text-4xl">{profile.nickname}</h1>
            <p className="mt-1 text-sm text-muted">{t.memberSince(memberSince)}</p>
          </div>
          <div className="rounded-2xl border border-line bg-surface-2/60 px-8 py-4 text-center">
            <p className="eyebrow">{t.totalPoints}</p>
            <p className="mt-1 font-display text-4xl font-black tabular-nums text-gradient">{profile.totalPoints}</p>
          </div>
        </div>
      </section>

      <section className="panel mt-6 p-6 sm:p-8">
        <h2 className="font-display text-lg font-bold">{t.genresTitle}</h2>
        {profile.genres.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {profile.genres.map((id) => (
              <li key={id} className="rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-sm text-volt-200">
                {genreLabel(id, locale)}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">{isOwner ? t.noGenresOwner : t.noGenres}</p>
        )}
      </section>

      {isOwner && <ProfileEditor avatar={profile.avatar} genres={profile.genres} />}

      {isOwner && (
        <section className="panel mt-6 p-6 sm:p-8">
          <h2 className="font-display text-lg font-bold">{t.blockedTitle}</h2>
          <p className="mt-1 text-sm text-muted">{t.blockedNote}</p>
          {blocked.length === 0 ? (
            <p className="mt-4 text-sm text-ink-400">{t.blockedEmpty}</p>
          ) : (
            <ul className="mt-4 divide-y divide-line/60">
              {blocked.map((name) => (
                <li key={name} className="flex items-center justify-between gap-4 py-2.5">
                  <span className="text-sm font-semibold">{name}</span>
                  <form action={unblock.bind(null, name)}>
                    <button type="submit" className="btn btn-ghost px-3 py-1.5 text-xs">
                      {t.unblock}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}
