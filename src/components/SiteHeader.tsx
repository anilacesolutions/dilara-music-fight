import { Suspense } from "react";
import { logout } from "@/app/actions/auth";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { Link } from "@/i18n/link";
import { getUi } from "@/i18n/server";
import { getCurrentUser } from "@/lib/auth";
import { avatarEmoji } from "@/lib/catalog";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/50 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <div className="flex items-center gap-2">
          {/* Phones reach Help from the footer; up here it would crowd the nav. */}
          <HelpLink />
          <LanguageSwitcher />
          {/* Session lookup streams in on its own so the rest of the page isn't held back. */}
          <Suspense fallback={<div className="h-9 w-40 animate-breathe rounded-xl bg-surface-2" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function HelpLink() {
  const ui = await getUi();

  return (
    <Link
      href="/help"
      className="hidden rounded-xl px-3 py-2 text-sm text-ink-200 transition hover:bg-surface-2 hover:text-foreground sm:inline-block"
    >
      {ui.header.help}
    </Link>
  );
}

export async function Logo() {
  const ui = await getUi();

  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label={ui.header.home}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-surface-2 ring-1 ring-line transition group-hover:ring-accent">
        <EqualizerMark />
      </span>
      {/* The wordmark steps aside on the narrowest phones so the nav always fits. */}
      <span className="hidden font-display text-sm font-bold tracking-tight min-[420px]:inline">
        <span className="text-player-a">MUSIC</span>
        <span className="text-player-b">FIGHT</span>
      </span>
    </Link>
  );
}

function EqualizerMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <rect x="3" y="9" width="3" height="10" rx="1.5" fill="var(--color-player-a)" />
      <rect x="10.5" y="4" width="3" height="15" rx="1.5" fill="var(--color-accent)" />
      <rect x="18" y="12" width="3" height="7" rx="1.5" fill="var(--color-player-b)" />
    </svg>
  );
}

async function UserMenu() {
  const [user, ui] = await Promise.all([getCurrentUser(), getUi()]);

  if (!user) {
    return (
      // Compact on phones: German labels are a good deal longer than Turkish ones.
      <nav className="flex items-center gap-1.5 sm:gap-2">
        <Link href="/login" className="btn btn-ghost px-3 py-2 text-xs sm:px-4 sm:text-sm">
          {ui.header.login}
        </Link>
        <Link href="/signup" className="btn btn-primary px-3 py-2 text-xs sm:px-4 sm:text-sm">
          {ui.header.signup}
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-1.5 sm:gap-2">
      <Link href="/lobby" className="btn btn-ghost hidden px-4 py-2 sm:inline-flex">
        {ui.header.lobby}
      </Link>
      <Link
        href={`/profile/${user.nickname}`}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-surface-2"
      >
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-surface-2 text-lg">
          {avatarEmoji(user.avatar)}
        </span>
        <span className="hidden text-sm font-semibold sm:inline">{user.nickname}</span>
        <span className="rounded-md bg-accent/15 px-1.5 py-0.5 font-mono text-xs text-volt-300">
          {user.totalPoints}
        </span>
      </Link>
      <form action={logout}>
        <button type="submit" className="rounded-lg px-2 py-2 text-xs text-muted hover:text-foreground">
          {ui.header.logout}
        </button>
      </form>
    </nav>
  );
}
