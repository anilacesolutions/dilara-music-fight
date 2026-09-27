"use client";

import { useEffect, useState } from "react";
import { useUi } from "@/i18n/client";

interface ScriptedMove {
  side: "a" | "b";
  player: string;
  artist: string;
  song: string;
  card: "yellow" | "red" | null;
  verdict: { tone: "neutral" | "match" | "mismatch"; label: string; points: string };
}

const TICK_MS = 1500;
const SCRIPT_LENGTH = 3;
// Each move takes two ticks (appear, then reveal), plus a pause before looping.
const LOOP_TICKS = SCRIPT_LENGTH * 2 + 3;

const verdictTone = {
  neutral: "border-line text-muted",
  match: "border-mint/40 bg-mint/10 text-mint",
  mismatch: "border-blaze/50 bg-blaze/10 text-blaze",
};

export function FightPreview() {
  const [tick, setTick] = useState(0);
  const ui = useUi();
  const t = ui.preview;
  const verdictNames = ui.verdict;

  useEffect(() => {
    const timer = setInterval(() => setTick((value) => (value + 1) % LOOP_TICKS), TICK_MS);
    return () => clearInterval(timer);
  }, []);

  /** A tiny looping match that shows, rather than tells, how a fight goes. */
  const script: ScriptedMove[] = [
    {
      side: "a",
      player: "riffmaster",
      artist: "Dream Theater",
      song: "Pull Me Under",
      card: null,
      verdict: { tone: "match", label: t.opening, points: "+30" },
    },
    {
      side: "b",
      player: "doomqueen",
      artist: "Opeth",
      song: "Ghost of Perdition",
      card: null,
      verdict: { tone: "match", label: t.match, points: "+30" },
    },
    {
      side: "a",
      player: "riffmaster",
      artist: "Tarkan",
      song: "Şımarık",
      card: "red",
      verdict: { tone: "mismatch", label: t.mismatch, points: "−20 −10" },
    },
  ];

  return (
    <div className="panel relative w-full max-w-md p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between text-xs">
        <span className="font-semibold text-player-a">riffmaster</span>
        <span className="eyebrow">{t.live}</span>
        <span className="font-semibold text-player-b">doomqueen</span>
      </div>

      <ol className="space-y-3">
        {script.map((move, index) => {
          const visible = tick >= index * 2;
          const revealed = tick >= index * 2 + 1;
          if (!visible) return <li key={index} className="h-[74px]" aria-hidden="true" />;

          return (
            <li
              key={`${index}-${tick < index * 2 + 1}`}
              className={`animate-rise-in flex flex-col ${move.side === "a" ? "items-start" : "items-end"}`}
            >
              <div
                className={`relative max-w-[85%] rounded-2xl border px-3.5 py-2.5 ${
                  move.side === "a"
                    ? "rounded-tl-sm border-flare-500/30 bg-flare-900/60"
                    : "rounded-tr-sm border-pulse-500/30 bg-pulse-900/60"
                } ${revealed && move.verdict.tone === "mismatch" ? "animate-shake" : ""}`}
              >
                <p className="text-[11px] text-muted">{t.played(move.player)}</p>
                <p className="text-sm font-semibold">
                  {move.artist} <span className="text-muted">—</span> {move.song}
                </p>

                {revealed && move.card && (
                  <span
                    className={`animate-flip-in absolute -right-3 -top-3 h-8 w-6 rounded-[4px] shadow-lg ${
                      move.card === "red" ? "bg-blaze" : "bg-sun"
                    }`}
                    style={{ ["--tilt" as string]: "12deg", transform: "rotate(12deg)" }}
                    title={move.card === "red" ? verdictNames.red : verdictNames.yellow}
                  />
                )}
              </div>

              <span
                className={`mt-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] transition-opacity duration-500 ${
                  verdictTone[move.verdict.tone]
                } ${revealed ? "opacity-100" : "opacity-0"}`}
              >
                {move.verdict.label} · {move.verdict.points}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
