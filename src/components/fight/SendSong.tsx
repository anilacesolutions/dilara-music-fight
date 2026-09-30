"use client";

import Image from "next/image";
import { useState } from "react";
import { useLocale, useUi } from "@/i18n/client";
import { genreLabel } from "@/lib/catalog";
import { formatDuration } from "@/lib/format";
import { MAX_TRACK_SECONDS, SCORING } from "@/lib/rules";
import type { GenreOptionView } from "@/lib/types";
import { getJson } from "./api";

interface Preview {
  videoId: string;
  title: string;
  channel: string;
  durationSeconds: number;
}

interface SendSongProps {
  isOpening: boolean;
  /** The genre the two players settled on; the opening song is judged against it. */
  genre: GenreOptionView | null;
  busy: boolean;
  /** Resolves true when the server accepted the song. */
  onSend: (url: string) => Promise<boolean>;
}

const watchUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

export function SendSong({ isOpening, genre, busy, onSend }: SendSongProps) {
  // Searching is the way in; pasting a link stays for when the quota runs out
  // or somebody already has the link in hand.
  const [pasting, setPasting] = useState(false);

  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Preview[] | null>(null);
  const [searching, setSearching] = useState(false);

  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [checking, setChecking] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const ui = useUi();
  const locale = useLocale();
  const t = ui.send;

  /** One search, on submit only. Searching as the player types would spend the
   *  day's quota in an afternoon. */
  async function runSearch(event: React.FormEvent) {
    event.preventDefault();
    const words = query.trim();
    if (!words) return;

    setSearching(true);
    setProblem(null);
    setPreview(null);
    try {
      const data = await getJson<{ hits: Preview[] }>(`/api/tracks/search?q=${encodeURIComponent(words)}`);
      setHits(data.hits);
    } catch (err) {
      setHits(null);
      setProblem(err instanceof Error && err.message ? err.message : t.searchFailed);
    } finally {
      setSearching(false);
    }
  }

  function pick(hit: Preview) {
    setPreview(hit);
    setUrl(watchUrl(hit.videoId));
    setProblem(null);
  }

  async function check(event: React.FormEvent) {
    event.preventDefault();
    const link = url.trim();
    if (!link) return;

    setChecking(true);
    setProblem(null);
    setPreview(null);
    try {
      const data = await getJson<{ track: Preview }>(`/api/tracks/preview?url=${encodeURIComponent(link)}`);
      setPreview(data.track);
    } catch (err) {
      setProblem(err instanceof Error && err.message ? err.message : t.checkFailed);
    } finally {
      setChecking(false);
    }
  }

  async function send() {
    if (await onSend(url.trim())) {
      setUrl("");
      setQuery("");
      setHits(null);
      setPreview(null);
    }
  }

  return (
    <div className="panel p-5 sm:p-6">
      <p className="eyebrow text-mint">{t.yourTurn}</p>
      <h2 className="mt-1 font-display text-xl font-black sm:text-2xl">
        {isOpening ? t.openingTitle : t.replyTitle}
      </h2>
      <p className="mt-1.5 text-sm text-ink-300">
        {isOpening && genre ? (
          <>
            {t.openingWithGenreBefore}
            <strong className="text-volt-200">{genreLabel(genre, locale)}</strong>
            {t.openingWithGenreAfter(SCORING.match, SCORING.mismatch)}
          </>
        ) : isOpening ? (
          t.openingNoGenre
        ) : (
          t.reply(SCORING.match, SCORING.mismatch)
        )}
      </p>

      {pasting ? (
        <form onSubmit={check} className="mt-5 flex flex-col gap-2 sm:flex-row">
          {/* A pasted link is long and awkward to wipe on a phone, so it gets its own button. */}
          <div className="relative flex-1">
            <input
              value={url}
              onChange={(event) => {
                setUrl(event.target.value);
                setPreview(null);
                setProblem(null);
              }}
              type="url"
              inputMode="url"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              placeholder="https://www.youtube.com/watch?v=…"
              aria-label={t.urlLabel}
              className="field w-full pr-11"
            />
            {url !== "" && (
              <button
                type="button"
                onClick={() => {
                  setUrl("");
                  setPreview(null);
                  setProblem(null);
                }}
                aria-label={t.clear}
                title={t.clear}
                className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-lg text-muted transition hover:bg-surface-2 hover:text-ink-100"
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" disabled={checking || !url.trim()} className="btn btn-ghost shrink-0">
            {checking ? t.checking : t.check}
          </button>
        </form>
      ) : (
        <form onSubmit={runSearch} className="mt-5 flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              type="search"
              autoComplete="off"
              placeholder={t.searchPlaceholder}
              aria-label={t.searchLabel}
              className="field w-full pr-11"
            />
            {query !== "" && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setHits(null);
                  setPreview(null);
                  setProblem(null);
                }}
                aria-label={t.clear}
                title={t.clear}
                className="absolute right-1 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-lg text-muted transition hover:bg-surface-2 hover:text-ink-100"
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" disabled={searching || !query.trim()} className="btn btn-ghost shrink-0">
            {searching ? t.searching : t.search}
          </button>
        </form>
      )}

      <button
        type="button"
        onClick={() => {
          setPasting((was) => !was);
          setProblem(null);
          setPreview(null);
        }}
        className="mt-2 text-xs text-muted underline decoration-dotted underline-offset-2 transition hover:text-ink-200"
      >
        {pasting ? t.searchInstead : t.pasteInstead}
      </button>

      {problem && <p className="mt-3 text-sm text-blaze">{problem}</p>}

      {!pasting && hits !== null && hits.length === 0 && !searching && (
        <p className="mt-3 text-sm text-muted">{t.noResults}</p>
      )}

      {!pasting && hits !== null && hits.length > 0 && (
        <ul className="mt-4 max-h-96 space-y-1 overflow-y-auto pr-1">
          {hits.map((hit) => {
            const chosen = preview?.videoId === hit.videoId;
            return (
              <li key={hit.videoId}>
                <button
                  type="button"
                  onClick={() => pick(hit)}
                  aria-pressed={chosen}
                  className={`flex w-full items-center gap-3 rounded-xl border p-2 text-left transition ${
                    chosen ? "border-volt-400/60 bg-volt-500/10" : "border-transparent hover:bg-surface-2/60"
                  }`}
                >
                  <Image
                    src={`https://i.ytimg.com/vi/${hit.videoId}/mqdefault.jpg`}
                    alt=""
                    width={96}
                    height={54}
                    unoptimized
                    className="h-[54px] w-24 shrink-0 rounded-lg object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 block text-sm font-medium">{hit.title}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {hit.channel} · {formatDuration(hit.durationSeconds)}
                    </span>
                  </span>
                  <span className={`shrink-0 text-xs font-semibold ${chosen ? "text-volt-200" : "text-muted"}`}>
                    {t.pick}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {preview && (
        <div className="animate-rise-in mt-4 flex flex-col gap-4 rounded-2xl border border-line bg-surface-2/60 p-3 sm:flex-row sm:items-center">
          <Image
            src={`https://i.ytimg.com/vi/${preview.videoId}/mqdefault.jpg`}
            alt=""
            width={160}
            height={90}
            unoptimized
            className="h-[90px] w-40 shrink-0 rounded-xl object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 text-sm font-semibold">{preview.title}</p>
            <p className="mt-0.5 text-xs text-muted">
              {preview.channel} · {formatDuration(preview.durationSeconds)}
            </p>
          </div>
          <button type="button" onClick={() => void send()} disabled={busy} className="btn btn-primary shrink-0">
            {busy ? t.submitting : t.submit}
          </button>
        </div>
      )}

      <p className="mt-4 text-xs text-muted">{t.limits(MAX_TRACK_SECONDS / 60)}</p>
    </div>
  );
}
