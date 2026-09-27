import { cookies } from "next/headers";
import { locale as localeParam } from "next/root-params";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALE_TAGS, isLocale, type Locale } from "./config";
import { SITE, type Site } from "./site";
import { UI, type Ui } from "./ui";

/**
 * Every page lives under app/[locale], so the language is a root parameter and
 * any Server Component can read it without being handed it as a prop.
 */
export async function currentLocale(): Promise<Locale> {
  const value = await localeParam();
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getSite(): Promise<Site> {
  return SITE[await currentLocale()];
}

export async function getUi(): Promise<Ui> {
  return UI[await currentLocale()];
}

/** BCP-47 tag for Intl formatting on the server. */
export async function getLocaleTag(): Promise<string> {
  return LOCALE_TAGS[await currentLocale()];
}

/**
 * Root parameters aren't available in Server Actions or Route Handlers, so
 * those read the cookie the proxy keeps in step with the URL instead.
 */
export async function cookieLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}
