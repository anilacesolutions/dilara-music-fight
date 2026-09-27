/**
 * The three languages the site ships in. Turkish is the source of truth:
 * every other dictionary is typed against it, so a missing or mistyped
 * translation is a build error rather than a blank label in production.
 */

export const LOCALES = ["tr", "en", "de"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "tr";

/** Name in its own language, for the picker. */
export const LOCALE_NAMES: Record<Locale, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
};

/** Short label for the header button. */
export const LOCALE_SHORT: Record<Locale, string> = { tr: "TR", en: "EN", de: "DE" };

/** Used for Intl date and number formatting. */
export const LOCALE_TAGS: Record<Locale, string> = { tr: "tr-TR", en: "en-US", de: "de-DE" };

export function isLocale(value: string | undefined): value is Locale {
  return value !== undefined && (LOCALES as readonly string[]).includes(value);
}

/** Remembers the choice for visitors who land on a path without a locale. */
export const LOCALE_COOKIE = "mf_locale";

/**
 * Picks the best match for an Accept-Language header.
 * "de-CH,de;q=0.9,en;q=0.8" resolves to "de".
 */
export function matchLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, ...rest] = part.trim().split(";");
      const quality = rest.find((piece) => piece.trim().startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: quality ? Number(quality.split("=")[1]) || 0 : 1 };
    })
    .sort((a, b) => b.q - a.q);

  for (const { tag } of ranked) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}

/** Strips a leading locale segment: "/en/lobby" -> "/lobby". */
export function pathWithoutLocale(pathname: string): string {
  const [, first, ...rest] = pathname.split("/");
  return isLocale(first) ? `/${rest.join("/")}` : pathname;
}

/** Builds the same page in another language: ("/en/lobby", "de") -> "/de/lobby". */
export function localizePath(pathname: string, locale: Locale): string {
  const bare = pathWithoutLocale(pathname);
  return `/${locale}${bare === "/" ? "" : bare}`;
}
