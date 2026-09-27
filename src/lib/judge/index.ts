import { BedrockJudge } from "./bedrock";
import { MockJudge } from "./mock";
import type { Judge } from "./types";

export type { Judge, JudgeInput, JudgeResult } from "./types";

let cached: Judge | null = null;

/**
 * Returns the active song referee.
 *
 * JUDGE_PROVIDER=bedrock asks Amazon Bedrock (Nova Lite); "mock" is the
 * title-similarity stand-in, which cannot actually tell genres apart.
 */
export function getJudge(): Judge {
  if (cached) return cached;

  const provider = process.env.JUDGE_PROVIDER ?? "mock";

  switch (provider) {
    case "mock":
      cached = new MockJudge();
      break;
    case "bedrock":
      cached = new BedrockJudge();
      break;
    default:
      throw new Error(`Bilinmeyen JUDGE_PROVIDER: "${provider}". "mock" ya da "bedrock" olmalı.`);
  }

  return cached;
}
