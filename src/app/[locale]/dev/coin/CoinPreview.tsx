"use client";

import { useState } from "react";
import { MatchSetup } from "@/components/fight/MatchSetup";
import { useLocale, useUi } from "@/i18n/client";
import { SITE } from "@/i18n/site";
import { genreLabel } from "@/lib/catalog";
import type { CoinSide, PlayerSlot, RoomView } from "@/lib/types";

/**
 * A throwaway sandbox for the opening sequence: it fakes the server so the
 * coin and the genre step can be watched without a database behind them.
 */

const PLAYERS = [
  { slot: "a" as PlayerSlot, nickname: "riffmaster", avatar: "guitar", score: 0, cards: { yellow: 2, red: 1 }, booked: { yellow: 0, red: 0 }, reviews: 1, wantsToEnd: false },
  { slot: "b" as PlayerSlot, nickname: "doomqueen", avatar: "skull", score: 0, cards: { yellow: 2, red: 1 }, booked: { yellow: 0, red: 0 }, reviews: 1, wantsToEnd: false },
];

const OPTIONS = ["prog-metal", "rock", "jazz", "funk", "synthwave"];

const other = (slot: PlayerSlot): PlayerSlot => (slot === "a" ? "b" : "a");
const flip = (): CoinSide => (Math.random() < 0.5 ? "yazi" : "tura");

function freshRoom(me: PlayerSlot): RoomView {
  return {
    code: "DEMO1",
    status: "active",
    turn: "a",
    winner: null,
    players: PLAYERS,
    moves: [],
    me,
    phase: "coin",
    setup: {
      coin: {
        thrownBy: null,
        thrownAt: null,
        pickedBy: null,
        sides: null,
        result: null,
        starter: null,
        resolvedAt: null,
        deadline: Date.now() + 120_000,
        auto: false,
      },
      genre: { options: OPTIONS, picker: null, proposed: null, vetoed: false, locked: null, deadline: null, auto: false },
    },
    genre: null,
    canCancel: true,
    listenRatio: 0.8,
    listenUnlockAt: null,
    turnDeadline: null,
    canAgreeToEnd: false,
    spectatorsAllowed: true,
    spectatorChatAllowed: true,
    refereeStandIn: false,
    spectatorCount: 0,
    endReason: null,
    forfeitedBy: null,
    bonusAwarded: false,
    version: 0,
  };
}

export function CoinPreview() {
  const [me, setMe] = useState<PlayerSlot>("a");
  const [room, setRoom] = useState<RoomView>(() => freshRoom("a"));
  const locale = useLocale();
  const ui = useUi();
  const t = SITE[locale].devCoin;

  const setup = room.setup;

  function reset(seat: PlayerSlot) {
    setMe(seat);
    setRoom(freshRoom(seat));
  }

  function patch(next: (current: RoomView) => RoomView) {
    setRoom((current) => ({ ...next(current), version: current.version + 1 }));
  }

  function onThrow() {
    patch((current) => ({
      ...current,
      setup: { ...current.setup!, coin: { ...current.setup!.coin, thrownBy: me, thrownAt: Date.now() } },
    }));
  }

  /** Mirrors the server: the caller keeps `side`, the opponent gets the other one. */
  function onCall(side: CoinSide) {
    const result = flip();
    const starter = result === side ? me : other(me);
    patch((current) => ({
      ...current,
      turn: starter,
      phase: "genre",
      setup: {
        coin: {
          ...current.setup!.coin,
          pickedBy: me,
          sides: { [me]: side, [other(me)]: side === "yazi" ? "tura" : "yazi" } as Record<PlayerSlot, CoinSide>,
          result,
          starter,
          resolvedAt: Date.now(),
          deadline: null,
        },
        genre: { ...current.setup!.genre, picker: other(starter), deadline: Date.now() + 120_000 },
      },
    }));
  }

  function onPropose(genre: string) {
    patch((current) =>
      current.setup!.genre.vetoed
        ? lock(current, genre)
        : { ...current, setup: { ...current.setup!, genre: { ...current.setup!.genre, proposed: genre } } },
    );
  }

  function onAnswer(accept: boolean) {
    patch((current) => {
      const genre = current.setup!.genre;
      if (accept) return lock(current, genre.proposed);
      return {
        ...current,
        setup: {
          ...current.setup!,
          genre: {
            ...genre,
            vetoed: true,
            proposed: null,
            options: genre.options.filter((option) => option !== genre.proposed),
          },
        },
      };
    });
  }

  function lock(current: RoomView, option: string | null): RoomView {
    return {
      ...current,
      genre: option,
      phase: current.turn === current.me ? "send" : "opponent",
      setup: { ...current.setup!, genre: { ...current.setup!.genre, proposed: null, locked: option, deadline: null } },
    };
  }

  const coin = setup?.coin;
  const done = setup?.genre.locked;

  return (
    <div className="space-y-5">
      <div className="panel flex flex-wrap items-center gap-3 p-4 text-sm">
        <span className="text-muted">{t.whoseEyes}</span>
        {PLAYERS.map((player) => (
          <button
            key={player.slot}
            type="button"
            onClick={() => reset(player.slot)}
            className={`btn px-4 py-2 ${me === player.slot ? "btn-primary" : "btn-ghost"}`}
          >
            {player.nickname}
          </button>
        ))}
        <button type="button" onClick={() => reset(me)} className="btn btn-ghost ml-auto px-4 py-2">
          {t.restart}
        </button>
      </div>

      {done ? (
        <div className="panel p-8 text-center">
          <p className="text-4xl">🎼</p>
          <h2 className="mt-3 font-display text-xl font-black">
            {ui.genre.startingSoon(genreLabel(done, locale))}
          </h2>
          <p className="mt-2 text-sm text-ink-300">
            {t.openingLine}{" "}
            <strong>{PLAYERS.find((player) => player.slot === coin?.starter)?.nickname}</strong>
          </p>
          <button type="button" onClick={() => reset(me)} className="btn btn-primary mt-6 px-6">
            {t.watchAgain}
          </button>
        </div>
      ) : (
        <MatchSetup
          room={room}
          busy={false}
          onThrow={onThrow}
          onCall={onCall}
          onPropose={onPropose}
          onAnswer={onAnswer}
        />
      )}

      <p className="text-center text-xs text-muted">{t.fakeNote}</p>
    </div>
  );
}
