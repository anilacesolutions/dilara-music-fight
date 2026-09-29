"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useUi } from "@/i18n/client";
import {
  CONSENT_REOPEN_EVENT,
  readConsent,
  serverConsent,
  startAnalytics,
  stopAnalytics,
  subscribeConsent,
  writeConsent,
  type Consent,
} from "@/lib/analytics";

/**
 * The question, asked once. Until it is answered nothing is loaded, so a
 * reader who never touches it is never measured. The footer can bring it back
 * for anybody who changes their mind.
 */
export function ConsentBanner() {
  const t = useUi().consent;
  const decision = useSyncExternalStore(subscribeConsent, readConsent, serverConsent);
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const reopen = () => setReopened(true);
    window.addEventListener(CONSENT_REOPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_REOPEN_EVENT, reopen);
  }, []);

  // Picks tracking back up on a later visit, once the answer is already yes.
  useEffect(() => {
    if (decision === "granted") void startAnalytics();
  }, [decision]);

  function answer(value: Exclude<Consent, null>) {
    writeConsent(value);
    setReopened(false);
    if (value === "granted") void startAnalytics();
    else stopAnalytics();
  }

  if (decision !== null && !reopened) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="panel mx-auto flex max-w-3xl flex-col gap-4 p-4 shadow-2xl sm:flex-row sm:items-center sm:gap-6 sm:p-5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-300">{t.body}</p>
          {decision !== null && (
            <p className="mt-1.5 text-[11px] text-muted">
              {decision === "granted" ? t.currentlyGranted : t.currentlyDenied}
            </p>
          )}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => answer("denied")}
            className="btn btn-ghost flex-1 px-4 py-2.5 text-sm sm:flex-none"
          >
            {t.decline}
          </button>
          <button
            type="button"
            onClick={() => answer("granted")}
            className="btn btn-primary flex-1 px-5 py-2.5 text-sm sm:flex-none"
          >
            {t.accept}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Footer entry point: brings the question back after it has been answered. */
export function ConsentLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_REOPEN_EVENT))}
      className="hover:text-foreground"
    >
      {label}
    </button>
  );
}
