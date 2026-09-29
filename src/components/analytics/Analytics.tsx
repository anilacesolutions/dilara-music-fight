"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { pathWithoutLocale } from "@/i18n/config";
import { identify, resetIdentity, track } from "@/lib/analytics";

/**
 * Page views and who is looking. Every call here is a no-op until consent has
 * been given, so this can sit in the layout without a second thought.
 *
 * The path is recorded without its locale prefix and without room codes, so
 * "/room/[code]" is one row rather than one per match.
 */
export function Analytics({ userId, locale }: { userId: string | null; locale: string }) {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const lastUser = useRef<string | null>(null);

  useEffect(() => {
    if (userId === lastUser.current) return;
    lastUser.current = userId;
    if (userId) identify(userId);
    else resetIdentity();
  }, [userId]);

  useEffect(() => {
    const page = normalise(pathWithoutLocale(pathname));
    if (page === lastPath.current) return;
    lastPath.current = page;
    track("page_viewed", { page, locale, signed_in: userId !== null });
  }, [pathname, locale, userId]);

  return null;
}

/** Room codes and nicknames are identifiers, not pages. */
function normalise(path: string): string {
  return path
    .replace(/^\/room\/[^/]+/, "/room/[code]")
    .replace(/^\/profile\/[^/]+/, "/profile/[nickname]");
}
