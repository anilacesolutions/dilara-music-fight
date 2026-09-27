import type { Locale } from "../config";
import { errors as de } from "./de";
import { errors as en } from "./en";
import { errors as tr, type Errors } from "./tr";

export const ERRORS: Record<Locale, Errors> = { tr, en, de };

export type ErrorKey = keyof Errors;

/** What each message needs, or `undefined` for the ones that take nothing. */
export type ErrorParams = {
  [K in ErrorKey]: Errors[K] extends (params: infer P) => string ? P : undefined;
};

/**
 * No extra argument for a plain message, exactly one for a message that
 * interpolates - so a forgotten parameter is a build error.
 */
export type ErrorArgs<K extends ErrorKey> = ErrorParams[K] extends undefined ? [] : [params: ErrorParams[K]];

export function translateError(locale: Locale, key: ErrorKey, params: unknown): string {
  const entry = ERRORS[locale][key];
  return typeof entry === "function" ? (entry as (value: unknown) => string)(params) : entry;
}

export type { Errors };
