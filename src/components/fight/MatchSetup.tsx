"use client";

import { useEffect, useState } from "react";
import type { CoinSide, RoomView } from "@/lib/types";
import { COIN_HOLD_MS, COIN_LAND_MS, CoinToss } from "./CoinToss";
import { GenrePick } from "./GenrePick";

interface MatchSetupProps {
  room: RoomView;
  busy: boolean;
  onThrow: () => void;
  onCall: (side: CoinSide) => void;
  onPropose: (genre: string) => void;
  onAnswer: (accept: boolean) => void;
}

/**
 * Everything that happens before the first song: the toss, then the genre.
 * The coin keeps the stage until its landing has been seen, even though the
 * server moved on the moment a side was called.
 */
export function MatchSetup({ room, busy, onThrow, onCall, onPropose, onAnswer }: MatchSetupProps) {
  const setup = room.setup;
  const resolvedAt = setup?.coin.resolvedAt ?? null;
  const [coinSeen, setCoinSeen] = useState(false);

  useEffect(() => {
    if (resolvedAt === null) return;
    const wait = resolvedAt + COIN_LAND_MS + COIN_HOLD_MS - Date.now();
    const timer = setTimeout(() => setCoinSeen(true), Math.max(0, wait));
    return () => clearTimeout(timer);
  }, [resolvedAt]);

  if (!setup || setup.genre.locked) return null;

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
