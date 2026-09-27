"use client";

import { useState } from "react";
import { Visualizer } from "@/components/Visualizer";
import { useUi } from "@/i18n/client";

export function WaitingRoom({ code, inviteUrl }: { code: string; inviteUrl: string }) {
  const [copied, setCopied] = useState<"link" | "code" | null>(null);
  const t = useUi().waiting;

  async function copy(value: string, which: "link" | "code") {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      // Clipboard blocked; the text is on screen to copy by hand.
    }
  }

  return (
    <div className="panel relative overflow-hidden p-6 sm:p-8">
      <Visualizer
        playing={false}
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-1/2 opacity-60 md:block"
      />
      <div className="relative">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="mt-1 font-display text-2xl font-black sm:text-3xl">{t.title}</h2>
        <p className="mt-2 max-w-md text-sm text-ink-300">{t.body}</p>

        <div className="mt-6">
          <p className="eyebrow">{t.roomCode}</p>
          <button
            type="button"
            onClick={() => void copy(code, "code")}
            className="mt-2 flex items-center gap-4 rounded-2xl border border-line bg-surface-2/70 px-5 py-3 transition hover:border-accent"
          >
            <span className="font-display text-3xl font-black tracking-[0.35em] text-gradient">{code}</span>
            <span className="text-xs text-muted">{copied === "code" ? t.copied : t.copy}</span>
          </button>
        </div>

        <div className="mt-5">
          <label htmlFor="invite-link" className="eyebrow">
            {t.inviteLink}
          </label>
          <div className="mt-2 flex gap-2">
            <input id="invite-link" readOnly value={inviteUrl} className="field font-mono text-xs" />
            <button type="button" onClick={() => void copy(inviteUrl, "link")} className="btn btn-primary shrink-0">
              {copied === "link" ? t.copied : t.copyLink}
            </button>
          </div>
        </div>

        <p className="animate-breathe mt-6 text-sm text-volt-300">{t.waitingForOpponent}</p>
      </div>
    </div>
  );
}
