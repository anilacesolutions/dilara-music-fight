import "server-only";
import { z } from "zod";

/*
 * The parts of refereeing that do not depend on which model answers: the
 * shapes a reply must fit, and the safeguard standing between a chat message
 * and a deleted account.
 */

/** How sure the chat referee must be before a message counts as a tip. */
export const CHAT_TIP_CONFIDENCE = 0.85;

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

export const RulingSchema = z.object({
  matches: z.boolean(),
  confidence: z.coerce.number().min(0).max(1).catch(0.5),
  reason: ReasonSchema,
  artist: z.string().nullable().catch(null),
  song: z.string().nullable().catch(null),
  genre: z.string().nullable().catch(null),
});

// ─── Chat referee ───────────────────────────────────────────────────────────

export const CHAT_SYSTEM_PROMPT = `Sen bir müzik düellosu oyununun sohbet hakemisin.

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

export const ChatReviewSchema = z.object({
  tip: z.boolean(),
  confidence: z.coerce.number().min(0).max(1).catch(0),
  evidence: z.string().nullable().catch(null),
  reason: z.string().catch(""),
});

export type ChatReviewReply = z.infer<typeof ChatReviewSchema>;

/** JSON Schema for the chat review, for providers that support structured output. */
export const CHAT_REVIEW_SCHEMA = {
  type: "object",
  properties: {
    tip: { type: "boolean" },
    confidence: { type: "number" },
    evidence: { type: ["string", "null"] },
    reason: { type: "string" },
  },
  required: ["tip", "confidence", "evidence", "reason"],
  additionalProperties: false,
} as const;

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
