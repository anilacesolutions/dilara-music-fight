"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocale, useUi } from "@/i18n/client";
import { LOCALES, LOCALE_NAMES, LOCALE_SHORT, localizePath, type Locale } from "@/i18n/config";

/**
 * Switches language on the spot: the same page in the new locale, and the
 * choice is remembered by the cookie the proxy writes on the way through.
 */
export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const ui = useUi();
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!boxRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function choose(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    router.push(localizePath(pathname, next));
    router.refresh();
  }

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={ui.language.change}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-xl border border-line bg-surface-2/60 px-2.5 py-2 text-xs font-bold transition hover:border-accent hover:text-foreground"
      >
        <GlobeMark />
        {LOCALE_SHORT[locale]}
      </button>

      {open && (
        <div
          role="menu"
          className="animate-rise-in absolute right-0 top-full z-50 mt-2 w-40 overflow-hidden rounded-xl border border-line bg-surface shadow-2xl"
        >
          {LOCALES.map((option) => (
            <button
              key={option}
              type="button"
              role="menuitem"
              onClick={() => choose(option)}
              className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-sm transition hover:bg-surface-2 ${
                option === locale ? "font-bold text-volt-300" : "text-ink-200"
              }`}
            >
              {LOCALE_NAMES[option]}
              <span className="font-mono text-[10px] text-muted">{LOCALE_SHORT[option]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GlobeMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18a15 15 0 0 1 0-18" />
    </svg>
  );
}
