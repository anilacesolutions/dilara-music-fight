"use client";

import { useUi } from "@/i18n/client";
import { avatarEmoji } from "@/lib/catalog";
import { CARDS_PER_PLAYER, YELLOWS_BEFORE_SENDING_OFF } from "@/lib/rules";
import type { PlayerSlot, PlayerView, RoomView } from "@/lib/types";

const TONES = {
  a: { text: "text-player-a", glow: "glow-a", wash: "from-flare-500/20" },
  b: { text: "text-player-b", glow: "glow-b", wash: "from-pulse-500/20" },
};

/**
 * The two player cards sit on the same column widths as the stage and the
 * sidebar below them, so the whole room reads as two columns running down the
 * page. VS straddles the gap by hanging off the first card's edge, which keeps
 * it centred whatever the ratio is at that breakpoint.
 */
export function Scoreboard({ room }: { room: RoomView }) {
  const bySlot = (slot: PlayerSlot) => room.players.find((player) => player.slot === slot);
  const live = room.status === "active";
  const activeSlot = live ? room.turn : null;

  return (
    <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-6">
      <div className="relative">
        <PlayerCard slot="a" player={bySlot("a")} active={activeSlot === "a"} live={live} isMe={room.me === "a"} />
        <span className="absolute right-0 top-1/2 z-20 grid h-7 w-7 -translate-y-1/2 translate-x-[calc(50%+6px)] place-items-center rounded-full border border-line bg-background font-display text-[10px] font-black text-ink-400 sm:h-8 sm:w-8 sm:text-xs lg:translate-x-[calc(50%+12px)]">
          VS
        </span>
      </div>
      <PlayerCard slot="b" player={bySlot("b")} active={activeSlot === "b"} live={live} isMe={room.me === "b"} />
    </div>
  );
}

interface PlayerCardProps {
  slot: PlayerSlot;
  player: PlayerView | undefined;
  /** This player is on turn. */
  active: boolean;
  /** The match is still running. */
  live: boolean;
  isMe: boolean;
}

function PlayerCard({ slot, player, active, live, isMe }: PlayerCardProps) {
  const ui = useUi();
  const t = ui.scoreboard;
  const tone = TONES[slot];

  if (!player) {
    return (
      <div className="panel animate-breathe grid h-full place-items-center p-4 text-center text-sm text-muted">
        {t.waitingForOpponent}
      </div>
    );
  }

  const mirrored = slot === "b";

  return (
    <div className={`panel relative h-full overflow-hidden p-3 transition sm:p-4 ${active ? tone.glow : ""}`}>
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent ${tone.wash}`} />
      <div className={`relative flex items-center gap-2 sm:gap-3 ${mirrored ? "flex-row-reverse text-right" : ""}`}>
        <span className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl bg-surface-2 text-2xl sm:grid">
          {avatarEmoji(player.avatar)}
        </span>

        <div className="min-w-0 flex-1">
          <p className={`truncate text-sm font-bold ${tone.text}`}>
            {player.nickname}
            {isMe && <span className="ml-1 text-xs font-normal text-muted">({ui.common.you})</span>}
          </p>
          {/* Cards shown against this player, not the ones they hold: these are what ends the match. */}
          <div className={`mt-1.5 flex items-center gap-1 ${mirrored ? "justify-end" : ""}`}>
            <CardPips
              color="yellow"
              filled={player.booked.yellow}
              total={YELLOWS_BEFORE_SENDING_OFF}
              title={t.bookedYellow(player.booked.yellow, YELLOWS_BEFORE_SENDING_OFF)}
            />
            <CardPips
              color="red"
              filled={player.booked.red}
              total={CARDS_PER_PLAYER.red}
              title={t.bookedRed(player.booked.red)}
            />
          </div>
        </div>

        <span className="font-display text-2xl font-black tabular-nums sm:text-4xl">{player.score}</span>
      </div>

      <div className={`relative mt-2 flex h-4 items-center gap-2 text-[11px] ${mirrored ? "justify-end" : ""}`}>
        {active && <span className="animate-breathe text-ink-300">{t.onTurn}</span>}
        {live && player.wantsToEnd && <span className="truncate text-volt-300">{t.wantsToEnd}</span>}
      </div>
    </div>
  );
}

function CardPips({
  color,
  filled,
  total,
  title,
}: {
  color: "yellow" | "red";
  /** How many of these have been shown and upheld. */
  filled: number;
  total: number;
  title: string;
}) {
  return (
    <span className="flex gap-0.5" title={title}>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={`h-4 w-3 rounded-[3px] ${color === "yellow" ? "bg-sun" : "bg-blaze"} ${index < filled ? "" : "opacity-20"}`}
        />
      ))}
    </span>
  );
}
