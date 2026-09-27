"use client";

import type { VisualizerBurst } from "@/components/Visualizer";
import { useLocale, useUi } from "@/i18n/client";
import { genreLabel } from "@/lib/catalog";
import type { RoomView } from "@/lib/types";
import { VerdictCard } from "./MoveHistory";
import { YouTubeStage } from "./YouTubeStage";

/** What a spectator sees: the song in play, or who's choosing next. */
export function SpectatorStage({ room, burst }: { room: RoomView; burst: VisualizerBurst | null }) {
  const ui = useUi();
  const locale = useLocale();
  const t = ui.spectator;

  const nameOf = (slot: string) => room.players.find((player) => player.slot === slot)?.nickname ?? ui.common.player;
  const onTurn = nameOf(room.turn);
  const last = room.moves.at(-1) ?? null;

  if (room.status === "waiting") {
    return (
      <div className="panel p-8 text-center">
        <p className="animate-breathe text-4xl">👀</p>
        <h2 className="mt-3 font-display text-lg font-bold">{t.waitingTitle}</h2>
        <p className="mt-1 text-sm text-muted">{t.waitingBody(nameOf("a"))}</p>
      </div>
    );
  }

  if (last && !last.revealed) {
    return (
      <YouTubeStage
        key={last.index}
        videoId={last.track.videoId}
        durationSeconds={last.track.durationSeconds}
        title={last.track.title}
        caption={t.nowPlaying(nameOf(last.slot), onTurn)}
        trackListening={false}
        requiredRatio={room.listenRatio}
        storageKey={`mf:watch:${room.code}:${last.index}`}
        burst={burst}
      />
    );
  }

  return (
    <>
      {last?.revealed && <VerdictCard move={last} heading={ui.verdict.theirResult(nameOf(last.slot))} />}
      <div className="panel p-8 text-center">
        <p className="animate-breathe text-4xl">🎚️</p>
        <p className="mt-3 font-display text-lg font-bold">
          {last ? t.choosing(onTurn) : t.choosingOpening(onTurn)}
        </p>
        <p className="mt-1 text-sm text-muted">
          {last || !room.genre ? t.willPlay : t.openingGenre(genreLabel(room.genre, locale))}
        </p>
      </div>
    </>
  );
}
