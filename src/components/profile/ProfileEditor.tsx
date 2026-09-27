"use client";

import { useActionState, useState } from "react";
import { saveProfile } from "@/app/actions/profile";
import { useLocale, useUi } from "@/i18n/client";
import { AVATARS, GENRES, MAX_GENRES, genreLabel } from "@/lib/catalog";
import { initialProfileState } from "@/lib/form-state";

interface ProfileEditorProps {
  avatar: string;
  genres: string[];
}

export function ProfileEditor({ avatar, genres }: ProfileEditorProps) {
  const [state, action, pending] = useActionState(saveProfile, initialProfileState);
  const [selectedAvatar, setSelectedAvatar] = useState(avatar);
  const [selectedGenres, setSelectedGenres] = useState(genres);
  const locale = useLocale();
  const t = useUi().profileEditor;

  function toggleGenre(id: string) {
    setSelectedGenres((current) => {
      if (current.includes(id)) return current.filter((genre) => genre !== id);
      return current.length >= MAX_GENRES ? current : [...current, id];
    });
  }

  return (
    <form action={action} className="panel mt-6 p-6 sm:p-8">
      <h2 className="font-display text-lg font-bold">{t.title}</h2>

      <fieldset className="mt-6">
        <legend className="eyebrow">{t.avatar}</legend>
        <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-12">
          {AVATARS.map((option) => {
            const selected = selectedAvatar === option.id;
            return (
              <label
                key={option.id}
                title={option.label}
                className={`grid aspect-square cursor-pointer place-items-center rounded-xl text-2xl ring-1 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-volt-300 ${
                  selected ? "scale-105 bg-accent/20 ring-accent" : "bg-surface-2 ring-line hover:ring-ink-500"
                }`}
              >
                <input
                  type="radio"
                  name="avatar"
                  value={option.id}
                  checked={selected}
                  onChange={() => setSelectedAvatar(option.id)}
                  className="sr-only"
                />
                <span aria-hidden="true">{option.emoji}</span>
                <span className="sr-only">{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-8">
        <legend className="eyebrow">{t.genres(selectedGenres.length, MAX_GENRES)}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {GENRES.map((genre) => {
            const on = selectedGenres.includes(genre.id);
            const full = !on && selectedGenres.length >= MAX_GENRES;
            return (
              <label
                key={genre.id}
                className={`rounded-full border px-3 py-1.5 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-volt-300 ${
                  on
                    ? "border-accent bg-accent/20 text-foreground"
                    : "border-line text-ink-300 hover:border-ink-500"
                } ${full ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
              >
                <input
                  type="checkbox"
                  name="genres"
                  value={genre.id}
                  checked={on}
                  disabled={full}
                  onChange={() => toggleGenre(genre.id)}
                  className="sr-only"
                />
                {genreLabel(genre.id, locale)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button type="submit" disabled={pending} className="btn btn-primary">
          {pending ? t.saving : t.save}
        </button>
        {state.status !== "idle" && (
          <p role="status" className={`text-sm ${state.status === "error" ? "text-blaze" : "text-mint"}`}>
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
