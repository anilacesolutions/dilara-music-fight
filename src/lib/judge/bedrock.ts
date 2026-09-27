import "server-only";
import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { z } from "zod";
import { GameError } from "../errors";
import type { ChatReferee, ChatReview, ChatReviewInput } from "./chat";
import { JUDGE_SYSTEM_PROMPT, buildJudgePrompt } from "./prompt";
import type { Judge, JudgeInput, JudgeResult } from "./types";

/*
 * Referees backed by Amazon Bedrock (Nova Lite by default).
 *
 * Auth comes from AWS_BEARER_TOKEN_BEDROCK, which the AWS SDK reads on its
 * own; region and model come from AWS_REGION and BEDROCK_MODEL_ID. Replies are
 * asked for as plain JSON and validated, so any Converse-capable model works.
 */

const REQUEST_TIMEOUT_MS = 15_000;

/** How sure the chat referee must be before a message counts as a tip. */
const CHAT_TIP_CONFIDENCE = 0.85;

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

/** Pulls the JSON object out of a reply, tolerating code fences or chatter around it. */
export function extractJson(reply: string): unknown {
  const start = reply.indexOf("{");
  const end = reply.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object in the model reply.");
  return JSON.parse(reply.slice(start, end + 1));
}

// ─── Song referee ───────────────────────────────────────────────────────────

/**
 * A reason in one language still beats no reason at all, so a missing
 * translation falls back to whichever one the model did write.
 */
const ReasonSchema = z
  .object({ tr: z.string().default(""), en: z.string().default(""), de: z.string().default("") })
  .or(z.string().transform((text) => ({ tr: text, en: text, de: text })))
  .transform((reason) => {
    const fallback = reason.tr || reason.en || reason.de;
    return { tr: reason.tr || fallback, en: reason.en || fallback, de: reason.de || fallback };
  })
  .refine((reason) => reason.tr.length > 0, { error: "Empty ruling reason." });

const RulingSchema = z.object({
  matches: z.boolean(),
  confidence: z.coerce.number().min(0).max(1).catch(0.5),
  reason: ReasonSchema,
  artist: z.string().nullable().catch(null),
  song: z.string().nullable().catch(null),
  genre: z.string().nullable().catch(null),
});

export class BedrockJudge implements Judge {
  readonly id = "bedrock";

  async judge(input: JudgeInput): Promise<JudgeResult> {
    let reply: string;
    try {
      reply = await converse(JUDGE_SYSTEM_PROMPT, buildJudgePrompt(input), 400);
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

// ─── Chat referee ───────────────────────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `Sen bir müzik düellosu oyununun sohbet hakemisin.

Oyunda iki oyuncu sırayla YouTube'dan şarkı atar; her şarkı bir öncekinin formatına
uymak zorundadır. Sohbeti oyuncular ve izleyiciler birlikte kullanır.

Site Türkçe, İngilizce ve Almanca yayında; mesaj bu üç dilden herhangi birinde
(ya da karışık) olabilir. Hangi dilde yazıldığından bağımsız olarak değerlendir.

YASAK: Bir oyuncuya hangi şarkıyı ya da sanatçıyı atması gerektiğini söylemek; atılacak
şarkı için isim, sanatçı, albüm, şarkı sözü veya onu tanıtan belirgin bir ipucu vermek.
Örnekler: "Opeth at", "Metallica'dan One uyar", "şunu dene: Pull Me Under",
"sözlerinde 'nothing else matters' geçen şarkıyı at".

YASAK DEĞİL: Zaten çalınmış şarkılar hakkında konuşmak, tezahürat, şaka, selamlaşma,
genel yorum, somut şarkı ya da sanatçı içermeyen tür istekleri ("metal gelsin").

Bu karar bir hesabın kalıcı olarak silinmesine yol açar. Sadece açık ve tartışmasız
durumlarda "tip": true de. Emin değilsen false.

Cevabını SADECE şu JSON ile ver, başka hiçbir şey yazma:
{"tip": boolean, "confidence": number, "evidence": string|null, "reason": string}
- confidence: 0 ile 1 arası
- evidence: mesajda ipucunu veren kelimelerin harfi harfine kopyası; ipucu yoksa null
- reason: Türkçe, tek cümle`;

const ChatReviewSchema = z.object({
  tip: z.boolean(),
  confidence: z.coerce.number().min(0).max(1).catch(0),
  evidence: z.string().nullable().catch(null),
  reason: z.string().catch(""),
});

export type ChatReviewReply = z.infer<typeof ChatReviewSchema>;

/**
 * A tip only counts when the model is sure AND can quote the exact words that
 * give it away. A quote that isn't really in the message means the model is
 * guessing, and nobody loses an account over a guess.
 */
export function isGroundedTip(text: string, review: ChatReviewReply): boolean {
  if (!review.tip || review.confidence < CHAT_TIP_CONFIDENCE || !review.evidence) return false;

  const normalize = (value: string) =>
    value.toLocaleLowerCase("tr").replace(/["'“”‘’]/g, "").replace(/\s+/g, " ").trim();
  const evidence = normalize(review.evidence);
  return evidence.length >= 3 && normalize(text).includes(evidence);
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
