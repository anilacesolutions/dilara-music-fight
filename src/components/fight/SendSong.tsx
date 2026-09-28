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

export function SendSong({ isOpening, genre, busy, onSend }: SendSongProps) {
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [checking, setChecking] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const ui = useUi();
  const locale = useLocale();
  const t = ui.send;

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

      {problem && <p className="mt-3 text-sm text-blaze">{problem}</p>}

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
