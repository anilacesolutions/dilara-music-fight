"use client";

import { useEffect, useState } from "react";
import type { CoinSide, RoomView } from "@/lib/types";
import { COIN_HOLD_MS, COIN_LAND_MS, CoinToss } from "./CoinToss";
import { GenrePick } from "./GenrePick";
import { ListenPick } from "./ListenPick";

interface MatchSetupProps {
  room: RoomView;
  busy: boolean;
  onThrow: () => void;
  onCall: (side: CoinSide) => void;
  onPropose: (genre: string) => void;
  onAnswer: (accept: boolean) => void;
  onProposeListen: (ratio: number) => void;
  onAcceptListen: () => void;
}

/**
 * Everything that happens before the first song: the toss, the genre, then
 * how much of each song has to be heard.
 * The coin keeps the stage until its landing has been seen, even though the
 * server moved on the moment a side was called.
 */
export function MatchSetup({
  room,
  busy,
  onThrow,
  onCall,
  onPropose,
  onAnswer,
  onProposeListen,
  onAcceptListen,
}: MatchSetupProps) {
  const setup = room.setup;
  const resolvedAt = setup?.coin.resolvedAt ?? null;
  const [coinSeen, setCoinSeen] = useState(false);

  useEffect(() => {
    if (resolvedAt === null) return;
    const wait = resolvedAt + COIN_LAND_MS + COIN_HOLD_MS - Date.now();
    const timer = setTimeout(() => setCoinSeen(true), Math.max(0, wait));
    return () => clearTimeout(timer);
  }, [resolvedAt]);

  if (!setup) return null;

  // The genre is settled; all that is left is how much of each song to hear.
  if (setup.genre.locked) {
    return setup.listen.ratio === null ? (
      <ListenPick
        listen={setup.listen}
        me={room.me}
        players={room.players}
        busy={busy}
        onPropose={onProposeListen}
        onAccept={onAcceptListen}
      />
    ) : null;
  }

  return coinSeen ? (
    <GenrePick
      genre={setup.genre}
      me={room.me}
      starter={setup.coin.starter}
      players={room.players}
      busy={busy}
      onPropose={onPropose}
      onAnswer={onAnswer}
    />
  ) : (
    <CoinToss
      coin={setup.coin}
      me={room.me}
      players={room.players}
      busy={busy}
      onThrow={onThrow}
      onCall={onCall}
    />
  );
}
