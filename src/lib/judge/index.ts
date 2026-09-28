import { BedrockJudge } from "./bedrock";
import { MockJudge } from "./mock";
import { OpenAIJudge } from "./openai";
import type { Judge } from "./types";

export type { Judge, JudgeInput, JudgeResult } from "./types";

let cached: Judge | null = null;

/**
 * Returns the active song referee.
 *
 * JUDGE_PROVIDER=openai asks OpenAI, "bedrock" asks Amazon Bedrock (Nova
 * Lite), and "mock" is the title-similarity stand-in, which cannot actually
 * tell genres apart and passes every opening song.
 */
export function getJudge(): Judge {
  if (cached) return cached;

  const provider = process.env.JUDGE_PROVIDER ?? "mock";

  switch (provider) {
    case "mock":
      cached = new MockJudge();
      break;
    case "openai":
      cached = new OpenAIJudge();
      break;
    case "bedrock":
      cached = new BedrockJudge();
      break;
    default:
      throw new Error(
        `Bilinmeyen JUDGE_PROVIDER: "${provider}". "openai", "bedrock" ya da "mock" olmalı.`,
      );
  }

  return cached;
}
