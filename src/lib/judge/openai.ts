import "server-only";
import { GameError } from "../errors";
import type { ChatReferee, ChatReview, ChatReviewInput } from "./chat";
import { JUDGE_RESULT_SCHEMA, JUDGE_SYSTEM_PROMPT, buildJudgePrompt } from "./prompt";
import {
  CHAT_REVIEW_SCHEMA,
  CHAT_SYSTEM_PROMPT,
  ChatReviewSchema,
  RulingSchema,
  extractJson,
  isGroundedTip,
} from "./shared";
import type { Judge, JudgeInput, JudgeResult } from "./types";

/*
 * Referees backed by OpenAI's chat completions.
 *
 * OPENAI_API_KEY authenticates; OPENAI_MODEL picks the model and defaults to a
 * small one, which is all this job needs. Replies come back through structured
 * outputs, so the model cannot answer with prose around the JSON, and they are
 * still validated afterwards - a schema guarantees the shape, not the sense.
 */

const ENDPOINT = "https://api.openai.com/v1/chat/completions";
const DEFAULT_MODEL = "gpt-5.4-mini";
const REQUEST_TIMEOUT_MS = 20_000;

/** Reasoning models spend tokens before they answer, so leave room for both. */
const RULING_TOKENS = 3_000;
const REVIEW_TOKENS = 2_000;

interface Completion {
  choices?: { message?: { content?: string | null; refusal?: string | null } }[];
}

/**
 * One round trip, answered in the given JSON schema.
 * `name` only labels the schema for the API; it never reaches the player.
 */
async function complete(
  system: string,
  prompt: string,
  schema: { name: string; shape: object },
  maxTokens: number,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set.");

  const response = await fetch(ENDPOINT, {
    method: "POST",
    cache: "no-store",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      temperature: 0,
      max_completion_tokens: maxTokens,
      response_format: {
        type: "json_schema",
        json_schema: { name: schema.name, schema: schema.shape, strict: true },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI responded ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }

  const data = (await response.json()) as Completion;
  const message = data.choices?.[0]?.message;
  // A refusal is the model declining the whole task, not a ruling against the song.
  if (message?.refusal) throw new Error(`OpenAI refused: ${message.refusal}`);
  if (!message?.content) throw new Error("OpenAI returned an empty reply.");
  return message.content;
}

export class OpenAIJudge implements Judge {
  readonly id = "openai";

  async judge(input: JudgeInput): Promise<JudgeResult> {
    let reply: string;
    try {
      reply = await complete(
        JUDGE_SYSTEM_PROMPT,
        buildJudgePrompt(input),
        { name: "ruling", shape: JUDGE_RESULT_SCHEMA },
        RULING_TOKENS,
      );
    } catch (error) {
      console.error("[referee] OpenAI call failed", error);
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

export class OpenAIChatReferee implements ChatReferee {
  readonly id = "openai";

  async review(input: ChatReviewInput): Promise<ChatReview> {
    try {
      const reply = await complete(
        CHAT_SYSTEM_PROMPT,
        `Mesajı yazan: ${input.authorIsPlayer ? "oyuncu" : "izleyici"}\nMesaj: """${input.text}"""`,
        { name: "chat_review", shape: CHAT_REVIEW_SCHEMA },
        REVIEW_TOKENS,
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
