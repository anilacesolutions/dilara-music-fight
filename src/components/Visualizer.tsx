"use client";

import { useEffect, useRef } from "react";

export type BurstColor = "sun" | "blaze" | "mint" | "volt" | "flare" | "pulse";

export interface VisualizerBurst {
  /** Change the id to fire another burst, even with the same colour. */
  id: number;
  color: BurstColor;
}

interface VisualizerProps {
  playing: boolean;
  burst?: VisualizerBurst | null;
  className?: string;
}

const BAR_COUNT = 72;
const BPM = 112;

interface Ring {
  startedAt: number;
  color: string;
}

function cssColor(name: string, fallback: string): string {
  if (typeof window === "undefined") return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

/**
 * Generative visualizer. YouTube's audio can't be analysed from an embed, so
 * this doesn't react to the actual sound. It follows the play state instead,
 * and game events (cards, verdicts) fire bursts of colour on top.
 */
export function Visualizer({ playing, burst, className }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playingRef = useRef(playing);
  const ringsRef = useRef<Ring[]>([]);

  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  useEffect(() => {
    if (!burst) return;
    ringsRef.current.push({
      startedAt: performance.now(),
      color: cssColor(`--base-${burst.color}`, "#8b5cf6"),
    });
  }, [burst]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette = {
      flare: cssColor("--base-flare", "#ff3d7f"),
      volt: cssColor("--base-volt", "#8b5cf6"),
      pulse: cssColor("--base-pulse", "#22d3ee"),
    };

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * ratio;
      canvas.height = canvas.clientHeight * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    let energy = 0.15;
    let frame = 0;
    const startedAt = performance.now();

    const draw = (now: number) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const t = ((now - startedAt) / 1000) * (reducedMotion ? 0.25 : 1);

      // Ease towards the target so play/pause glides instead of snapping.
      energy += ((playingRef.current ? 1 : 0.14) - energy) * 0.04;

      const beatPhase = (t * BPM) / 60;
      const kick = reducedMotion ? 0 : Math.pow(Math.max(0, Math.sin(beatPhase * Math.PI)), 12);

      context.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.2;
      const reach = Math.min(width, height) * 0.24;

      // Core glow.
      const glow = context.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * (1.6 + kick * 0.4));
      glow.addColorStop(0, `${palette.volt}66`);
      glow.addColorStop(1, `${palette.volt}00`);
      context.fillStyle = glow;
      context.beginPath();
      context.arc(cx, cy, radius * (1.6 + kick * 0.4), 0, Math.PI * 2);
      context.fill();

      // Radial bars, magenta on one side fading to cyan on the other - the two players.
      for (let i = 0; i < BAR_COUNT; i += 1) {
        const angle = (i / BAR_COUNT) * Math.PI * 2 - Math.PI / 2;
        const wave =
          0.5 + 0.5 * Math.sin(t * 2.3 + i * 0.42) * Math.cos(t * 0.9 + i * 0.13) +
          0.25 * Math.sin(t * 5.1 + i * 1.9);
        const length = 4 + reach * energy * Math.max(0.08, wave) * (0.75 + kick * 0.5);

        const x1 = cx + Math.cos(angle) * radius;
        const y1 = cy + Math.sin(angle) * radius;
        const x2 = cx + Math.cos(angle) * (radius + length);
        const y2 = cy + Math.sin(angle) * (radius + length);

        const side = Math.cos(angle);
        context.strokeStyle = side > 0.3 ? palette.pulse : side < -0.3 ? palette.flare : palette.volt;
        context.globalAlpha = 0.35 + 0.65 * energy;
        context.lineWidth = Math.max(2, (Math.PI * 2 * radius) / BAR_COUNT - 3);
        context.lineCap = "round";
        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
      }
      context.globalAlpha = 1;

      // Inner ring.
      context.strokeStyle = `${palette.volt}aa`;
      context.lineWidth = 1.5;
      context.beginPath();
      context.arc(cx, cy, radius * (0.9 + kick * 0.05 * energy), 0, Math.PI * 2);
      context.stroke();

      // Event bursts: rings that expand and fade.
      ringsRef.current = ringsRef.current.filter((ring) => now - ring.startedAt < 1100);
      for (const ring of ringsRef.current) {
        const progress = (now - ring.startedAt) / 1100;
        context.strokeStyle = ring.color;
        context.globalAlpha = 1 - progress;
        context.lineWidth = 6 * (1 - progress) + 1;
        context.beginPath();
        context.arc(cx, cy, radius + progress * Math.max(width, height) * 0.5, 0, Math.PI * 2);
        context.stroke();
      }
      context.globalAlpha = 1;

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
