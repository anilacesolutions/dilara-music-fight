"use client";

import { useEffect, useState } from "react";
import { useUi } from "@/i18n/client";
import type { CoinSide, CoinView, PlayerSlot, PlayerView } from "@/lib/types";

/** Must match .animate-coin-land / .animate-coin-drop in globals.css. */
export const COIN_LAND_MS = 2200;
/** How long the result stays up before the genre step takes the stage. */
export const COIN_HOLD_MS = 2200;

/** Face 0deg is "heads"; the back face sits half a turn further on. */
const landingAngle = (side: CoinSide) => (side === "tura" ? 1980 : 1800);

interface CoinTossProps {
  coin: CoinView;
  /** Null for spectators, who watch without touching anything. */
  me: PlayerSlot | null;
  players: PlayerView[];
  busy: boolean;
  onThrow: () => void;
  onCall: (side: CoinSide) => void;
}

export function CoinToss({ coin, me, players, busy, onThrow, onCall }: CoinTossProps) {
  const ui = useUi();
  const t = ui.coin;
  const sideName: Record<CoinSide, string> = { yazi: t.yazi, tura: t.tura };

  /** The landing animation has played out, so the result may be announced. */
  const [landed, setLanded] = useState(false);
  // Starts at 0 so the server and the browser render the same markup.
  const [now, setNow] = useState(0);

  const resolvedAt = coin.resolvedAt;
  useEffect(() => {
    if (resolvedAt === null) return;
    const timer = setTimeout(() => setLanded(true), Math.max(0, resolvedAt + COIN_LAND_MS - Date.now()));
    return () => clearTimeout(timer);
  }, [resolvedAt]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const nameOf = (slot: PlayerSlot | null) =>
    players.find((player) => player.slot === slot)?.nickname ?? ui.common.opponent;
  const thrown = coin.thrownAt !== null;
  const resolved = resolvedAt !== null;
  const result = coin.result ?? "yazi";
  const mine = me !== null;
  const secondsLeft = coin.deadline && now ? Math.max(0, Math.ceil((coin.deadline - now) / 1000)) : null;

  let status: string;
  if (!thrown) {
    status = mine ? t.idleMine : t.idleWatching(nameOf("a"), nameOf("b"));
  } else if (!resolved) {
    status = mine ? t.spinningMine : t.spinningWatching;
  } else if (!landed) {
    status = t.falling;
  } else if (coin.starter === me) {
    status = t.resultMine(sideName[result]);
  } else {
    status = t.resultOther(sideName[result], nameOf(coin.starter));
  }

  return (
    <section className="panel relative overflow-hidden p-6 text-center sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sun/10 to-transparent" />

      <p className="eyebrow relative">{t.eyebrow}</p>
      <h2 className="relative mt-1 font-display text-xl font-black sm:text-2xl">{t.title}</h2>

      <div className="coin-stage relative mt-6 grid h-40 place-items-center">
        <div className={resolved ? "animate-coin-drop" : thrown ? "animate-coin-hover" : "animate-coin-rise"}>
          <div
            className={`coin ${resolved ? "animate-coin-land" : thrown ? "animate-coin-spin" : ""}`}
            style={
              resolved
                ? ({
                    "--coin-land": `${landingAngle(result)}deg`,
                    "--coin-land-short": result === "tura" ? "180deg" : "0deg",
                  } as React.CSSProperties)
                : undefined
            }
          >
            <CoinFace side="yazi" label={t.yazi} />
            <CoinFace side="tura" label={t.tura} />
          </div>
        </div>
      </div>

      <p className={`relative mt-5 text-sm ${landed ? "font-semibold text-sun" : "text-ink-200"}`}>{status}</p>

      {coin.sides && (
        <p className="relative mt-2 text-xs text-muted">
          {me !== null
            ? t.sidesMine(sideName[coin.sides[me]], nameOf(me === "a" ? "b" : "a"), sideName[coin.sides[me === "a" ? "b" : "a"]])
            : t.sidesWatching(nameOf("a"), sideName[coin.sides.a], nameOf("b"), sideName[coin.sides.b])}
          {coin.auto ? t.pickedAuto : coin.pickedBy === me ? t.pickedByMe : t.pickedByOther(nameOf(coin.pickedBy))}
        </p>
      )}

      {mine && !resolved && (
        <div className="relative mt-6">
          {!thrown ? (
            <button type="button" disabled={busy} onClick={onThrow} className="btn btn-primary px-8 py-4 text-base">
              {t.throw}
            </button>
          ) : (
            <div className="flex flex-wrap justify-center gap-3">
              <SideButton side="yazi" label={t.yazi} busy={busy} onClick={() => onCall("yazi")} />
              <SideButton side="tura" label={t.tura} busy={busy} onClick={() => onCall("tura")} />
            </div>
          )}
          {secondsLeft !== null && <p className="mt-3 text-xs text-muted">{t.deadline(secondsLeft)}</p>}
        </div>
      )}
    </section>
  );
}

function SideButton({
  side,
  label,
  busy,
  onClick,
}: {
  side: CoinSide;
  label: string;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className="flex w-32 flex-col items-center gap-2 rounded-2xl border border-sun/40 bg-sun/10 p-4 text-sun transition enabled:hover:-translate-y-1 enabled:hover:bg-sun/20 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <SideMark side={side} size={28} />
      <span className="font-display text-base font-black">{label.toLocaleUpperCase()}</span>
    </button>
  );
}

function CoinFace({ side, label }: { side: CoinSide; label: string }) {
  return (
    <div className={`coin-face ${side === "tura" ? "coin-face-back" : ""}`}>
      <span className="flex flex-col items-center gap-0.5">
        <SideMark side={side} size={30} />
        <span className="font-display text-[11px] font-black tracking-[0.2em]">{label.toLocaleUpperCase()}</span>
      </span>
    </div>
  );
}

/** A note for heads, a plectrum for tails - drawn, so no font can turn them into boxes. */
function SideMark({ side, size }: { side: CoinSide; size: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
      {side === "yazi" ? (
        <path d="M12 3v10.6A4 4 0 1 0 14 17V7.5h4.5V3H12z" />
      ) : (
        <path d="M12 3c4.4 0 8 2.3 8 5.5 0 4.3-4.7 12.5-8 12.5S4 12.8 4 8.5C4 5.3 7.6 3 12 3z" />
      )}
    </svg>
  );
}
