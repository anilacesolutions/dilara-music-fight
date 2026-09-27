"use client";

import { useEffect, useState } from "react";
import { useUi } from "@/i18n/client";
import { formatDuration } from "@/lib/format";
import { TURN_SECONDS } from "@/lib/rules";

interface TurnClockProps {
  deadline: number | null;
  /** Whose move it is, as shown to this viewer. */
  label: string;
  mine: boolean;
}

/** Counts down to the forfeit deadline of the player on turn. */
export function TurnClock({ deadline, label, mine }: TurnClockProps) {
  const t = useUi().clock;
  // Starts at 0 so server and client render the same markup; the first tick fills it in.
  const [now, setNow] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (deadline === null || now === 0) return null;

  const left = Math.max(0, Math.ceil((deadline - now) / 1000));
  const urgent = left <= 60;
  // Before the 5-minute window opens, the time still includes the listening period.
  const listening = left > TURN_SECONDS;

  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm ${
        urgent ? "animate-breathe border-blaze/50 bg-blaze/10 text-blaze" : "border-line bg-surface-2/60 text-ink-200"
      }`}
    >
      <span>
        ⏱ {label}
        {listening && <span className="ml-1 text-xs text-muted">{t.includesListening}</span>}
      </span>
      <span className="font-mono text-base font-bold tabular-nums">
        {left === 0 ? (mine ? t.mineOver : t.theirOver) : formatDuration(left)}
      </span>
    </div>
  );
}
