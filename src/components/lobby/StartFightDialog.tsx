"use client";

import { useRef, useState } from "react";
import { useUi } from "@/i18n/client";
import { useLocaleRouter } from "@/i18n/link";

type OptionId = "friend" | "ai" | "watch";

const CODE_LENGTH = 5;

export function StartFightDialog() {
  const router = useLocaleRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchCode, setWatchCode] = useState<string | null>(null);
  const ui = useUi();
  const t = ui.startDialog;

  const options: { id: OptionId; icon: string; title: string; body: string; available: boolean }[] = [
    { id: "friend", icon: "🤝", title: t.friendTitle, body: t.friendBody, available: true },
    { id: "ai", icon: "🤖", title: t.aiTitle, body: t.aiBody, available: false },
    { id: "watch", icon: "👀", title: t.watchTitle, body: t.watchBody, available: true },
  ];

  async function inviteFriend() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/rooms", { method: "POST" });
      const data = (await res.json()) as { code?: string; error?: string };
      if (!res.ok || !data.code) throw new Error(data.error || t.createFailed);
      router.push(`/room/${data.code}`);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t.createFailed);
      setBusy(false);
    }
  }

  function choose(id: OptionId) {
    if (id === "friend") void inviteFriend();
    if (id === "watch") setWatchCode("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="btn btn-primary px-8 py-4 text-base"
      >
        <span aria-hidden="true">▶</span> {t.open}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby="start-fight-title"
        className="m-auto w-[min(92vw,48rem)] rounded-3xl border border-line bg-surface p-0 text-foreground shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
        onClick={(event) => {
          // A click on the backdrop lands on the dialog element itself.
          if (event.target === dialogRef.current) dialogRef.current.close();
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{t.eyebrow}</p>
              <h2 id="start-fight-title" className="mt-1 font-display text-2xl font-black">
                {t.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="rounded-lg px-2 py-1 text-xl text-muted hover:text-foreground"
              aria-label={ui.common.close}
            >
              ×
            </button>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                disabled={!option.available || busy}
                onClick={() => choose(option.id)}
                className={`group relative flex flex-col items-start rounded-2xl border bg-surface-2/60 p-5 text-left transition enabled:hover:-translate-y-1 enabled:hover:border-accent disabled:cursor-not-allowed ${
                  option.id === "watch" && watchCode !== null ? "border-accent" : "border-line"
                }`}
              >
                {!option.available && (
                  <span className="absolute right-3 top-3 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-volt-300">
                    {t.soon}
                  </span>
                )}
                <span className={`text-4xl transition group-enabled:group-hover:scale-110 ${option.available ? "" : "opacity-50 grayscale"}`}>
                  {option.icon}
                </span>
                <span className={`mt-4 font-display text-base font-bold ${option.available ? "" : "text-ink-400"}`}>
                  {option.title}
                </span>
                <span className="mt-1.5 text-sm leading-relaxed text-ink-400">{option.body}</span>
                {option.id === "friend" && busy && (
                  <span className="mt-3 animate-breathe text-xs text-volt-300">{t.creating}</span>
                )}
              </button>
            ))}
          </div>

          {watchCode !== null && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (watchCode.length === CODE_LENGTH) router.push(`/room/${watchCode}?watch=1`);
              }}
              className="animate-rise-in mt-4 flex flex-col gap-2 rounded-2xl border border-accent/40 bg-accent/5 p-4 sm:flex-row sm:items-end"
            >
              <div className="flex-1">
                <label htmlFor="watch-code" className="eyebrow">
                  {t.watchCodeLabel}
                </label>
                <input
                  id="watch-code"
                  value={watchCode}
                  onChange={(event) =>
                    setWatchCode(event.target.value.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, CODE_LENGTH))
                  }
                  placeholder="K7X2M"
                  autoComplete="off"
                  className="field mt-2 font-mono text-lg tracking-[0.5em]"
                />
              </div>
              <button type="submit" disabled={watchCode.length !== CODE_LENGTH} className="btn btn-primary py-3">
                {t.watchSubmit}
              </button>
            </form>
          )}

          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-blaze/40 bg-blaze/10 px-3 py-2 text-sm text-blaze">
              {error}
            </p>
          )}
        </div>
      </dialog>
    </>
  );
}
