/** Preset choices for profiles. No uploads: avatars are emoji, genres come from this list. */

import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";

export interface AvatarOption {
  id: string;
  emoji: string;
  label: string;
}

export const AVATARS: AvatarOption[] = [
  { id: "headphones", emoji: "🎧", label: "Kulaklık" },
  { id: "guitar", emoji: "🎸", label: "Gitar" },
  { id: "drum", emoji: "🥁", label: "Davul" },
  { id: "keys", emoji: "🎹", label: "Klavye" },
  { id: "mic", emoji: "🎤", label: "Mikrofon" },
  { id: "sax", emoji: "🎷", label: "Saksafon" },
  { id: "trumpet", emoji: "🎺", label: "Trompet" },
  { id: "violin", emoji: "🎻", label: "Keman" },
  { id: "banjo", emoji: "🪕", label: "Banjo" },
  { id: "notes", emoji: "🎼", label: "Nota" },
  { id: "radio", emoji: "📻", label: "Radyo" },
  { id: "disc", emoji: "💿", label: "Plak" },
  { id: "fire", emoji: "🔥", label: "Ateş" },
  { id: "bolt", emoji: "⚡", label: "Şimşek" },
  { id: "moon", emoji: "🌙", label: "Ay" },
  { id: "skull", emoji: "💀", label: "Kafatası" },
  { id: "wolf", emoji: "🐺", label: "Kurt" },
  { id: "fox", emoji: "🦊", label: "Tilki" },
  { id: "owl", emoji: "🦉", label: "Baykuş" },
  { id: "octopus", emoji: "🐙", label: "Ahtapot" },
  { id: "dragon", emoji: "🐉", label: "Ejderha" },
  { id: "unicorn", emoji: "🦄", label: "Tek boynuz" },
  { id: "alien", emoji: "👾", label: "Uzaylı" },
  { id: "robot", emoji: "🤖", label: "Robot" },
];

export const DEFAULT_AVATAR = "headphones";

export function avatarEmoji(id: string): string {
  return AVATARS.find((avatar) => avatar.id === id)?.emoji ?? "🎧";
}

/**
 * Genre names per language. Most are the same everywhere; the ones that are
 * genre proper nouns (Anadolu Rock, Arabesk) stay untranslated, while the
 * descriptive Turkish names are spelled out for readers who need them.
 */
export interface GenreOption {
  id: string;
  label: Record<Locale, string>;
}

const same = (name: string): Record<Locale, string> => ({ tr: name, en: name, de: name });

export const GENRES: GenreOption[] = [
  { id: "rock", label: same("Rock") },
  { id: "hard-rock", label: same("Hard Rock") },
  { id: "prog-rock", label: same("Progressive Rock") },
  { id: "metal", label: same("Metal") },
  { id: "prog-metal", label: same("Progressive Metal") },
  { id: "punk", label: same("Punk") },
  { id: "grunge", label: same("Grunge") },
  { id: "alternative", label: { tr: "Alternatif", en: "Alternative", de: "Alternative" } },
  { id: "indie", label: same("Indie") },
  { id: "pop", label: same("Pop") },
  { id: "kpop", label: same("K-Pop") },
  { id: "hiphop", label: same("Hip-Hop") },
  { id: "rap", label: same("Rap") },
  { id: "trap", label: same("Trap") },
  { id: "rnb", label: same("R&B") },
  { id: "soul", label: same("Soul") },
  { id: "funk", label: same("Funk") },
  { id: "jazz", label: { tr: "Caz", en: "Jazz", de: "Jazz" } },
  { id: "blues", label: same("Blues") },
  { id: "classical", label: { tr: "Klasik", en: "Classical", de: "Klassik" } },
  { id: "electronic", label: { tr: "Elektronik", en: "Electronic", de: "Elektronisch" } },
  { id: "house", label: same("House") },
  { id: "techno", label: same("Techno") },
  { id: "dnb", label: same("Drum & Bass") },
  { id: "synthwave", label: same("Synthwave") },
  { id: "lofi", label: same("Lo-fi") },
  { id: "reggae", label: same("Reggae") },
  { id: "latin", label: same("Latin") },
  { id: "country", label: same("Country") },
  { id: "folk", label: same("Folk") },
  { id: "anadolu-rock", label: same("Anadolu Rock") },
  { id: "turkce-pop", label: { tr: "Türkçe Pop", en: "Turkish Pop", de: "Türkischer Pop" } },
  { id: "turkce-rap", label: { tr: "Türkçe Rap", en: "Turkish Rap", de: "Türkischer Rap" } },
  { id: "arabesk", label: same("Arabesk") },
  { id: "thm", label: { tr: "Türk Halk Müziği", en: "Turkish Folk Music", de: "Türkische Volksmusik" } },
  { id: "tsm", label: { tr: "Türk Sanat Müziği", en: "Turkish Classical Music", de: "Türkische Kunstmusik" } },
];

export const MAX_GENRES = 8;

/**
 * Used to top up the match's genre options when two players share too few.
 * Broad, widely known genres on purpose: nobody should face a wall at kick-off.
 */
export const POPULAR_GENRES = ["rock", "pop", "turkce-rap", "metal", "electronic", "turkce-pop", "hiphop", "jazz"];

export function genreLabel(id: string, locale: Locale = DEFAULT_LOCALE): string {
  return GENRES.find((genre) => genre.id === id)?.label[locale] ?? id;
}

/**
 * The name handed to the referee. English is what models know these genres by,
 * whatever language the players are reading the site in.
 */
export function genreForJudge(id: string): string {
  return GENRES.find((genre) => genre.id === id)?.label.en ?? id;
}

export const isGenreId = (id: string): boolean => GENRES.some((genre) => genre.id === id);
