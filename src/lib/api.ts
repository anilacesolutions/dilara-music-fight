import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { translateError } from "@/i18n/errors";
import { cookieLocale } from "@/i18n/server";
import { getCurrentUser, type CurrentUser } from "./auth";
import { GameError } from "./errors";

/** Route Handler guard: every room endpoint acts on behalf of a signed-in player. */
export async function requireApiUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) throw new GameError("sessionExpired", 401);
  return user;
}

/**
 * Turns thrown errors into the shape the client expects: { error: string }.
 * Route Handlers can't read root params, so the reader's language comes from
 * the cookie the proxy keeps in step with the URL.
 */
export async function errorResponse(error: unknown): Promise<NextResponse> {
  const locale = await cookieLocale();

  if (error instanceof GameError) {
    return NextResponse.json(
      { error: translateError(locale, error.key, error.params) },
      { status: error.status },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: error.issues[0]?.message ?? translateError(locale, "invalidRequest", undefined) },
      { status: 422 },
    );
  }

  // Driver failures, bad config, bugs - log the detail, tell the player nothing.
  console.error("[music-fight]", error);
  return NextResponse.json({ error: translateError(locale, "serverProblem", undefined) }, { status: 500 });
}
