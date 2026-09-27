"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LOCALE, LOCALE_TAGS, type Locale } from "./config";
import { UI, type Ui } from "./ui";

/**
 * Client Components can't read root params, so the locale comes down from the
 * root layout through this context. Only the locale crosses the boundary; the
 * dictionaries themselves are plain imports, which keeps the functions in them
 * callable (functions can't be passed from a Server Component as props).
 */
const LocaleContext = createContext<Locale>(DEFAULT_LOCALE);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useUi(): Ui {
  return UI[useContext(LocaleContext)];
}

/** BCP-47 tag for Intl formatting in the browser. */
export function useLocaleTag(): string {
  return LOCALE_TAGS[useContext(LocaleContext)];
}
