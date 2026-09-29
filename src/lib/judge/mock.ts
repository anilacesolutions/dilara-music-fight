import type { Judge, JudgeInput, JudgeResult } from "./types";

/** Strips the noise YouTube uploaders bolt onto titles. */
function clean(title: string): string {
  return title
    .replace(/\((?:official|resmi)[^)]*\)/gi, "")
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\b(official|video|lyrics?|audio|hd|4k|remaster(ed)?|live|mv)\b/gi, "")
    // "(4K Remaster)" leaves "()" behind once its words are gone.
    .replace(/\(\s*\)/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Best-effort "Artist - Song" split from a YouTube title. */
function splitTitle(title: string): { artist: string | null; song: string | null } {
  const parts = clean(title).split(/\s[-–—|]\s/);
  if (parts.length >= 2) {
    return { artist: parts[0].trim() || null, song: parts.slice(1).join(" - ").trim() || null };
  }
  return { artist: null, song: clean(title) || null };
}

function tokens(value: string): Set<string> {
  return new Set(
    clean(value)
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((t) => t.length > 2),
  );
}

function overlap(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const token of a) if (b.has(token)) shared += 1;
  return shared / Math.min(a.size, b.size);
}

/**
 * Placeholder judge used until Vertex AI credentials are wired in.
 *
 * It has no musical knowledge whatsoever - it only compares channel and title
 * tokens, so "same artist" reads as a match and everything else is a coin the
 * house always calls in the player's favour. Good enough to exercise the game
 * loop end to end, useless as an actual referee.
 */
export class MockJudge implements Judge {
  readonly id = "mock";

  /** No second opinion to give: the stand-in already said all it knows. */
  async review(input: JudgeInput): Promise<JudgeResult> {
    return this.judge(input);
  }

  async judge(input: JudgeInput): Promise<JudgeResult> {
    const { artist, song } = splitTitle(input.current.title);

    if (!input.previous) {
      // A title tells this judge nothing about genre, so the opener always passes.
      return {
        matches: true,
        confidence: 0.2,
        reason: input.genre
          ? {
              tr: `Sahte hakem: açılış şarkısının "${input.genre}" türüne uyup uymadığını anlayamaz, geçerli sayıyor.`,
              en: `Mock referee: it can't tell whether the opening song is "${input.genre}", so it lets it through.`,
              de: `Test-Schiedsrichter: Er kann nicht erkennen, ob der Eröffnungssong "${input.genre}" ist, und lässt ihn durch.`,
            }
          : {
              tr: "Açılış hamlesi — karşılaştıracak önceki parça yok.",
              en: "Opening move — there's no previous track to compare with.",
              de: "Eröffnungszug — es gibt keinen vorherigen Song zum Vergleich.",
            },
        artist: artist ?? input.current.channel,
        song,
        genre: input.genre,
      };
    }

    const similarity = Math.max(
      overlap(tokens(input.previous.title), tokens(input.current.title)),
      input.previous.channel.toLowerCase() === input.current.channel.toLowerCase() ? 1 : 0,
    );

    const matches = similarity > 0.2;

    return {
      matches,
      confidence: 0.2, // deliberately low: this judge is a stand-in
      reason: matches
        ? {
            tr: "Sahte hakem: başlık/kanal benzerliği yakalandı.",
            en: "Mock referee: the titles or channels look alike.",
            de: "Test-Schiedsrichter: Titel oder Kanal ähneln sich.",
          }
        : {
            tr: "Sahte hakem: iki parça arasında benzerlik bulunamadı.",
            en: "Mock referee: no similarity found between the two tracks.",
            de: "Test-Schiedsrichter: keine Ähnlichkeit zwischen den beiden Songs gefunden.",
          },
      artist: artist ?? input.current.channel,
      song,
      genre: null,
    };
  }
}
