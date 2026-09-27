import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { ObjectId } from "mongodb";
import { sessionsCollection } from "./mongodb";

/**
 * Database sessions: the browser holds a random token, Mongo holds its hash.
 * Logging out deletes the row, so a stolen cookie stops working immediately.
 */
const COOKIE_NAME = "mf_session";
const SESSION_DAYS = 30;

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Call from a Server Action or Route Handler - cookies can't be set while rendering. */
export async function createSession(userId: ObjectId): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  const sessions = await sessionsCollection();
  await sessions.insertOne({ tokenHash: hashToken(token), userId, createdAt: new Date(), expiresAt });

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function readSessionUserId(): Promise<ObjectId | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;

  const sessions = await sessionsCollection();
  const session = await sessions.findOne({
    tokenHash: hashToken(token),
    expiresAt: { $gt: new Date() },
  });
  return session?.userId ?? null;
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;

  if (token) {
    const sessions = await sessionsCollection();
    await sessions.deleteOne({ tokenHash: hashToken(token) });
  }
  store.delete(COOKIE_NAME);
}
