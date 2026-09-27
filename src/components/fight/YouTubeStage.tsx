"use client";

import { useEffect, useRef, useState } from "react";
import { Visualizer, type VisualizerBurst } from "@/components/Visualizer";
import { useUi } from "@/i18n/client";
import { formatDuration } from "@/lib/format";

let apiPromise: Promise<typeof YT> | null = null;

/** Loads the IFrame Player API once per page, however many stages mount. */
function loadYouTubeApi(): Promise<typeof YT> {
  if (window.YT?.Player) return Promise.resolve(window.YT);

  apiPromise ??= new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve(window.YT as typeof YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  });
  return apiPromise;
}

function readCoverage(key: string): number[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((value): value is number => Number.isInteger(value)) : [];
  } catch {
    return [];
  }
}

function writeCoverage(key: string, seconds: Set<number>): void {
  try {
    localStorage.setItem(key, JSON.stringify([...seconds]));
  } catch {
    // Storage blocked: a refresh restarts the count, nothing worse.
  }
}

interface YouTubeStageProps {
  videoId: string;
  durationSeconds: number;
  title: string;
  caption: string;
  /** Count which seconds were actually heard, and report once enough are. */
  trackListening: boolean;
  requiredRatio: number;
  /** Where heard seconds are kept, so a page refresh doesn't reset the count. */
  storageKey: string;
  onListened?: () => void;
  burst: VisualizerBurst | null;
}

export function YouTubeStage({
  videoId,
  durationSeconds,
  title,
  caption,
  trackListening,
  requiredRatio,
  storageKey,
  onListened,
  burst,
}: YouTubeStageProps) {
  const t = useUi().stage;
  const hostRef = useRef<HTMLDivElement>(null);
  const onListenedRef = useRef(onListened);
  const [playing, setPlaying] = useState(false);
  const [heard, setHeard] = useState(0);
  const [silent, setSilent] = useState(false);

  const total = Math.max(1, Math.floor(durationSeconds));
  const required = Math.ceil(total * requiredRatio);

  useEffect(() => {
    onListenedRef.current = onListened;
  }, [onListened]);

  useEffect(() => {
    let cancelled = false;
    let player: YT.Player | null = null;
    let timer: ReturnType<typeof setInterval> | undefined;

    // Coverage is a set of whole seconds. Replaying a part doesn't count twice,
    // and seeking past a part doesn't count it at all.
    const coverage = new Set(readCoverage(storageKey));
    let reported = false;
    let lastTime = -1;
    let lastWall = 0;

    const reportIfDone = () => {
      if (!reported && coverage.size >= required) {
        reported = true;
        onListenedRef.current?.();
      }
    };

    void loadYouTubeApi().then((yt) => {
      if (cancelled || !hostRef.current) return;

      const mount = document.createElement("div");
      hostRef.current.replaceChildren(mount);

      player = new yt.Player(mount, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: { rel: 0, playsinline: 1, modestbranding: 1 },
        events: {
          onReady: () => {
            if (cancelled) return;
            setHeard(coverage.size);
            if (trackListening) reportIfDone();
          },
          onStateChange: (event) => {
            const isPlaying = event.data === yt.PlayerState.PLAYING;
            setPlaying(isPlaying);
            if (!isPlaying) lastTime = -1;
          },
        },
      });

      if (!trackListening) return;

      timer = setInterval(() => {
        if (!player || typeof player.getPlayerState !== "function") return;
        if (player.getPlayerState() !== yt.PlayerState.PLAYING) {
          lastTime = -1;
          return;
        }

        const muted = player.isMuted() || player.getVolume() === 0;
        setSilent(muted);

        const now = player.getCurrentTime();
        const wall = performance.now();

        if (!muted && lastTime >= 0) {
          const advanced = now - lastTime;
          const elapsed = (wall - lastWall) / 1000;
          // Normal playback only. A jump larger than the time that passed is a seek.
          if (advanced > 0 && advanced <= elapsed * 1.25 + 0.5) {
            for (let second = Math.floor(lastTime); second < Math.floor(now); second += 1) {
              if (second < total) coverage.add(second);
            }
          }
        }

        lastTime = now;
        lastWall = wall;
        setHeard(coverage.size);
        writeCoverage(storageKey, coverage);
        reportIfDone();
      }, 500);
    });

    return () => {
      cancelled = true;
      if (timer) clearInterval(timer);
      player?.destroy();
    };
  }, [videoId, storageKey, trackListening, total, required]);

  const heardPercent = Math.min(100, (heard / total) * 100);
  const done = heard >= required;

  return (
    <div className="panel overflow-hidden">
      <div className="relative aspect-video w-full bg-black">
        <div className="absolute inset-0 grid place-items-center text-sm text-muted">{t.loading}</div>
        <div ref={hostRef} className="absolute inset-0" />
      </div>

      <div className="relative h-36 border-t border-line/60 sm:h-44">
        <Visualizer playing={playing} burst={burst} className="absolute inset-0 h-full w-full" />
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-surface/90 to-transparent px-5 pt-3">
          <p className="eyebrow">{caption}</p>
          <p className="truncate text-sm font-semibold">{title}</p>
        </div>
      </div>

      {trackListening && (
        <div className="border-t border-line/60 px-5 py-4">
          <div className="flex items-center justify-between text-xs">
            <span className={done ? "font-semibold text-mint" : "text-ink-200"}>
              {done ? t.enough : t.heard(Math.floor(heardPercent))}
            </span>
            <span className="font-mono text-muted">{t.required(formatDuration(heard), formatDuration(required))}</span>
          </div>

          <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${done ? "bg-mint" : "bg-gradient-to-r from-flare-500 to-volt-500"}`}
              style={{ width: `${heardPercent}%` }}
            />
            <div
              className="absolute top-0 h-full w-0.5 bg-foreground/70"
              style={{ left: `${requiredRatio * 100}%` }}
              title={t.requiredMark}
            />
          </div>

          <p className="mt-2 text-xs text-muted">{silent ? t.muted : t.rules}</p>
        </div>
      )}
    </div>
  );
}
