import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { currentLocale } from "@/i18n/server";
import { usersCollection } from "./mongodb";
import { readSessionUserId } from "./session";

/** What pages and game logic get to know about the signed-in player. No personal data. */
export interface CurrentUser {
  id: string;
  nickname: string;
  avatar: string;
  totalPoints: number;
}

/** Memoised per request, so a header and a page can both ask without two lookups. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const userId = await readSessionUserId();
  if (!userId) return null;

  const users = await usersCollection();
  const user = await users.findOne(
    { _id: userId },
    { projection: { nickname: 1, avatar: 1, totalPoints: 1 } },
  );
  if (!user) return null;

  return {
    id: user._id.toHexString(),
    nickname: user.nickname,
    avatar: user.avatar,
    totalPoints: user.totalPoints,
  };
});

/**
 * For pages: send guests to login, then bring them back to `returnTo`.
 * `returnTo` is locale-free; the login page puts the reader's locale back on.
 */
export async function requireUser(returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    const locale = await currentLocale();
    redirect(`/${locale}/login?next=${encodeURIComponent(returnTo)}`);
  }
  return user;
}

/** Only same-site paths, so ?next= can never bounce someone to another origin. */
export function safeReturnPath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}
