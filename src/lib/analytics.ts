"use client";

import type { OverridedMixpanel } from "mixpanel-browser";

/*
 * Product analytics that cannot start without being asked.
 *
 * Mixpanel is not bundled into the page: nothing is downloaded, initialised or
 * stored until somebody has said yes. A refusal leaves the library unloaded,
 * so there is no request to Mixpanel at all - not an initialised SDK sitting
 * quietly with tracking switched off.
 */

export const CONSENT_COOKIE = "mf_consent";
export type Consent = "granted" | "denied" | null;

/** Fired on `window` when the footer asks for the banner again. */
export const CONSENT_REOPEN_EVENT = "mf:consent-reopen";

const TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
/** Set to https://api-eu.mixpanel.com for a project with EU data residency. */
const API_HOST = process.env.NEXT_PUBLIC_MIXPANEL_HOST;

let client: OverridedMixpanel | null = null;
let loading: Promise<OverridedMixpanel | null> | null = null;

export function readConsent(): Consent {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  const value = match?.[1];
  return value === "granted" || value === "denied" ? value : null;
}

export function writeConsent(value: Exclude<Consent, null>): void {
  // A year, on the whole site. Remembering the answer is what keeps us from asking again.
  const year = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_COOKIE}=${value}; path=/; max-age=${year}; samesite=lax`;
  for (const listener of listeners) listener();
}

/*
 * A cookie is not something React can watch, so the answer is published as a
 * tiny store instead: components read it with useSyncExternalStore and hear
 * about a change the moment it is written.
 */
const listeners = new Set<() => void>();

export function subscribeConsent(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Before hydration nothing is known, and a banner must not flash on the server. */
export const serverConsent = (): Consent => "granted";

/** Downloads and initialises Mixpanel. Only ever called after a yes. */
async function load(): Promise<OverridedMixpanel | null> {
  if (client) return client;
  if (!TOKEN) return null;

  loading ??= import("mixpanel-browser").then((module) => {
    const mixpanel = module.default;
    mixpanel.init(TOKEN, {
      ...(API_HOST ? { api_host: API_HOST } : {}),
      debug: process.env.NODE_ENV !== "production",
      // Route changes are tracked by hand; the built-in one only sees the first page.
      track_pageview: false,
      // Keeps Mixpanel from writing cookies of its own.
      persistence: "localStorage",
      // Belt and braces: even loaded, it stays quiet until opted in.
      opt_out_tracking_by_default: true,
    });
    mixpanel.opt_in_tracking();
    client = mixpanel;
    return mixpanel;
  });

  return loading;
}

/** Called once on load and again the moment consent is given. */
export async function startAnalytics(): Promise<void> {
  if (readConsent() !== "granted") return;
  await load();
}

/**
 * Forgets everything Mixpanel kept on this device. Called when somebody
 * changes their mind, so a refusal is not merely honoured from now on.
 */
export function stopAnalytics(): void {
  client?.opt_out_tracking();
  client = null;
  loading = null;
  if (typeof window === "undefined") return;
  for (const key of Object.keys(window.localStorage)) {
    if (key.startsWith("mp_")) window.localStorage.removeItem(key);
  }
}

type Properties = Record<string, string | number | boolean>;

/** Silently does nothing without consent, which is the whole point. */
export function track(event: string, properties: Properties = {}): void {
  if (!client) return;
  client.track(event, properties);
}

/** Pseudonymous on purpose: the account id and nothing else. */
export function identify(userId: string): void {
  client?.identify(userId);
}

export function resetIdentity(): void {
  client?.reset();
}
