import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, matchLocale } from "@/i18n/config";

/**
 * Locale routing. Every page lives under /<locale>/…, so a request without one
 * is redirected to the visitor's best guess: their saved choice first, then the
 * browser's Accept-Language, then Turkish.
 *
 * Once a locale is in the path it wins for that visit - a link shared in one
 * language opens in that language. Switching with the picker rewrites the path
 * and updates the cookie, which is also what Server Actions and Route Handlers
 * read, since they can't see root parameters.
 */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function preferredLocale(request: NextRequest) {
  const saved = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return matchLocale(request.headers.get("accept-language"));
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const first = pathname.split("/")[1];

  if (isLocale(first)) {
    const response = NextResponse.next();
    // Keep the cookie in step with the URL the visitor is actually reading.
    if (request.cookies.get(LOCALE_COOKIE)?.value !== first) {
      response.cookies.set(LOCALE_COOKIE, first, { path: "/", maxAge: COOKIE_MAX_AGE, sameSite: "lax" });
    }
    return response;
  }

  const locale = preferredLocale(request) || DEFAULT_LOCALE;
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  url.search = search;

  const redirect = NextResponse.redirect(url);
  redirect.cookies.set(LOCALE_COOKIE, locale, { path: "/", maxAge: COOKIE_MAX_AGE, sameSite: "lax" });
  return redirect;
}

export const config = {
  // Everything except API routes, Next's own assets and files with an extension.
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
