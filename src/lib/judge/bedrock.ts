import "server-only";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { GameError } from "../errors";
import type { ChatReferee, ChatReview, ChatReviewInput } from "./chat";
import {
  JUDGE_REVIEW_SYSTEM_PROMPT,
  JUDGE_SYSTEM_PROMPT,
  buildJudgePrompt,
  buildReviewPrompt,
} from "./prompt";
import {
  CHAT_SYSTEM_PROMPT,
  ChatReviewSchema,
  RulingSchema,
  extractJson,
  isGroundedTip,
} from "./shared";
import type { Judge, JudgeInput, JudgeResult } from "./types";

/*
 * Referees backed by Amazon Bedrock (Nova Lite by default).
 *
 * Auth comes from AWS_BEARER_TOKEN_BEDROCK, which the AWS SDK reads on its
 * own; region and model come from AWS_REGION and BEDROCK_MODEL_ID. Replies are
 * asked for as plain JSON and validated, so any Converse-capable model works.
 */

const REQUEST_TIMEOUT_MS = 15_000;

let client: BedrockRuntimeClient | null = null;

function bedrock(): BedrockRuntimeClient {
  client ??= new BedrockRuntimeClient({ region: process.env.AWS_REGION || "eu-central-1" });
  return client;
}

/** One Converse round trip; returns the model's text. */
async function converse(system: string, prompt: string, maxTokens: number): Promise<string> {
  const response = await bedrock().send(
    new ConverseCommand({
      modelId: process.env.BEDROCK_MODEL_ID || "eu.amazon.nova-lite-v1:0",
      system: [{ text: system }],
      messages: [{ role: "user", content: [{ text: prompt }] }],
      inferenceConfig: { maxTokens, temperature: 0 },
    }),
    { abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) },
  );

  return (response.output?.message?.content ?? []).map((block) => block.text ?? "").join("");
}

// Re-exported because these were Bedrock's before every provider shared them.
export { extractJson, isGroundedTip } from "./shared";
export type { ChatReviewReply } from "./shared";

export class BedrockJudge implements Judge {
  readonly id = "bedrock";

  async review(input: JudgeInput): Promise<JudgeResult> {
    return this.rule(JUDGE_REVIEW_SYSTEM_PROMPT, buildReviewPrompt(input), input, 700);
  }

  async judge(input: JudgeInput): Promise<JudgeResult> {
    return this.rule(JUDGE_SYSTEM_PROMPT, buildJudgePrompt(input), input, 400);
  }

  private async rule(system: string, prompt: string, input: JudgeInput, tokens: number): Promise<JudgeResult> {
    let reply: string;
    try {
      reply = await converse(system, prompt, tokens);
    } catch (error) {
      console.error("[referee] Bedrock call failed", error);
      throw new GameError("refereeUnavailable", 503);
    }

    try {
      const ruling = RulingSchema.parse(extractJson(reply));
      // Without a previous track and without a genre there is nothing to judge against.
      return input.previous || input.genre ? ruling : { ...ruling, matches: true };
    } catch (error) {
      console.error("[referee] unreadable ruling", { reply, error });
      throw new GameError("refereeUnreadable", 503);
    }
  }
}

export class BedrockChatReferee implements ChatReferee {
  readonly id = "bedrock";

  async review(input: ChatReviewInput): Promise<ChatReview> {
    try {
      const reply = await converse(
        CHAT_SYSTEM_PROMPT,
        `Mesajı yazan: ${input.authorIsPlayer ? "oyuncu" : "izleyici"}\nMesaj: """${input.text}"""`,
        200,
      );
      const review = ChatReviewSchema.parse(extractJson(reply));

      return isGroundedTip(input.text, review)
        ? { tip: true, reason: review.reason || `Sohbette ipucu: ${review.evidence}` }
        : { tip: false, reason: null };
    } catch (error) {
      // Fail open: an outage shouldn't silence the chat, and a doubtful call must never delete an account.
      console.error("[chat referee] review failed, message allowed", error);
      return { tip: false, reason: null };
    }
  }
}
