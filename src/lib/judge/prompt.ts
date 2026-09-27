import type { JudgeInput } from "./types";

/**
 * The rules the judge plays by. Kept provider-agnostic so the same wording
 * works whichever model we point at (Amazon Nova Lite on Bedrock for now).
 */
export const JUDGE_SYSTEM_PROMPT = `Sen bir "Music Fight" hakemisin.

Oyun: İki oyuncu sırayla YouTube'dan şarkı atar. Maç başlamadan önce oyuncular
bir TÜR üzerinde anlaşır; açılış şarkısı o türe uymak zorundadır. Ondan sonraki
her şarkı, bir önceki şarkının FORMATINA yakın olmak zorundadır.

"Format" şu boyutların bileşimidir:
- Tür ve alt tür (prog metal, nu metal, synthwave, arabesk, drill...)
- Enerji ve tempo
- Dönem ve sahne (90'lar Seattle grunge ile 2020 TikTok pop aynı şey değildir)
- Prodüksiyon karakteri (akustik, lo-fi, arena prodüksiyonu...)

Dil tek başına belirleyici değildir: Türkçe bir prog metal parçası, İngilizce bir
prog metal parçasına uyar. Ama Dream Theater'ın üstüne Tarkan gelmez.

Görevin: gelen şarkının, önceki şarkının formatına uyup uymadığına karar vermek.
Kararında cömert değil, adil ol. Komşu alt türler (death metal -> black metal)
uyar; farklı dünyalar (prog metal -> pop) uymaz.

Sana verilen bilgi bir YouTube video başlığı ve kanal adıdır. Bunlardan sanatçıyı,
şarkıyı ve türü kendi müzik bilginle çıkar. Başlıktaki "(Official Video)",
"Lyrics", "HD" gibi ekleri yok say.

Site üç dilde yayında ve kararını iki oyuncu da, bütün izleyiciler de okuyacak.
Gerekçeyi bir kez yazıyorsun; bu yüzden AYNI gerekçeyi üç dilde birden ver.

Cevabını SADECE şu JSON şemasında ver, başka hiçbir şey yazma:
{
  "matches": boolean,
  "confidence": number,   // 0 ile 1 arasında
  "reason": {
    "tr": string,         // Türkçe, en fazla iki cümle
    "en": string,         // aynı gerekçe, İngilizce
    "de": string          // aynı gerekçe, Almanca
  },
  "artist": string|null,
  "song": string|null,
  "genre": string|null
}`;

function describe(track: { title: string; channel: string }): string {
  return `başlık: "${track.title}" | kanal: "${track.channel}"`;
}

/** Builds the user-turn text for a single ruling. */
export function buildJudgePrompt(input: JudgeInput): string {
  if (!input.previous) {
    if (!input.genre) {
      return [
        "Bu maçın AÇILIŞ hamlesi ve üzerinde anlaşılmış bir tür yok.",
        `Gelen şarkı -> ${describe(input.current)}`,
        "",
        "matches alanını true yap, reason alanında parçanın formatını bir cümleyle tanımla.",
        "artist, song ve genre alanlarını doldur.",
      ].join("\n");
    }

    return [
      `Bu maçın AÇILIŞ hamlesi. Oyuncular maçın türünü "${input.genre}" olarak belirledi.`,
      `Gelen şarkı -> ${describe(input.current)}`,
      "",
      `Bu şarkı "${input.genre}" türüne giriyor mu? Karar ver.`,
      "Komşu alt türler kabul edilir; başka bir dünyadan gelen parça kabul edilmez.",
    ].join("\n");
  }

  const recent = input.history
    .slice(-4)
    .map((t, i) => `  ${i + 1}. ${describe(t)}`)
    .join("\n");

  return [
    "Maçtaki son hamleler (eskiden yeniye):",
    recent || "  (yok)",
    "",
    `ÖNCEKİ şarkı -> ${describe(input.previous)}`,
    `GELEN şarkı  -> ${describe(input.current)}`,
    "",
    "GELEN şarkı, ÖNCEKİ şarkının formatına uyuyor mu? Karar ver.",
  ].join("\n");
}

/** JSON Schema for the ruling, for providers that support structured output. */
export const JUDGE_RESULT_SCHEMA = {
  type: "object",
  properties: {
    matches: { type: "boolean" },
    confidence: { type: "number" },
    reason: {
      type: "object",
      properties: { tr: { type: "string" }, en: { type: "string" }, de: { type: "string" } },
      required: ["tr", "en", "de"],
      additionalProperties: false,
    },
    artist: { type: ["string", "null"] },
    song: { type: ["string", "null"] },
    genre: { type: ["string", "null"] },
  },
  required: ["matches", "confidence", "reason", "artist", "song", "genre"],
  additionalProperties: false,
} as const;
