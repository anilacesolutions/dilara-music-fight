import type { LocalizedText, Track } from "../types";

export interface JudgeInput {
  /** The track the opponent played last. Null on the opening move. */
  previous: Track | null;
  /** The track being submitted right now. */
  current: Track;
  /** Everything played so far, oldest first. Gives the judge context on the vibe. */
  history: Track[];
  /**
   * The genre the two players settled on before kick-off, in English ("Jazz").
   * The opening song is judged against this instead of a previous track.
   */
  genre: string | null;
}

export interface JudgeResult {
  /** Does `current` fit the format set by `previous` - or, on the opening move, the match genre? */
  matches: boolean;
  /** 0..1 - how sure the judge is. */
  confidence: number;
  /** One or two sentences, shown to both players and every spectator, in each language. */
  reason: LocalizedText;
  /** What the judge read the submitted track as. */
  artist: string | null;
  song: string | null;
  genre: string | null;
}

export interface Judge {
  /** Stable identifier stored on each verdict, e.g. "mock" or "openai". */
  readonly id: string;
  judge(input: JudgeInput): Promise<JudgeResult>;
  /**
   * The video check on a card that stood: the same question asked again, with
   * more evidence and more care. Its answer is final.
   */
  review(input: JudgeInput): Promise<JudgeResult>;
}
