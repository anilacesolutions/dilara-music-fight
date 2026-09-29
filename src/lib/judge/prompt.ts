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

/**
 * The second opinion. It sees the same evidence plus the first ruling, and is
 * told to take its time - its job is to catch a first ruling that was wrong,
 * not to agree out of politeness.
 */
export const JUDGE_REVIEW_SYSTEM_PROMPT = `Sen "Music Fight"ın VAR hakemisin.

Sahadaki hakem bir şarkıyı formata UYMUYOR diye işaretledi ve rakip bu karara
kart gösterdi. Şimdi karar sana geldi ve son söz senin.

Oyun: İki oyuncu sırayla YouTube'dan şarkı atar. Maçın bir açılış TÜRÜ vardır;
açılış şarkısı o türe uymak zorundadır. Sonraki her şarkı bir önceki şarkının
FORMATINA yakın olmak zorundadır. Format, tür ve alt tür, enerji ve tempo,
dönem ve sahne, prodüksiyon karakterinin bileşimidir.

Senden beklenen, sahadaki hakemden daha dikkatli bir inceleme:
- Sanatçıyı ve parçayı gerçekten tanı; başlıktaki "(Official Video)", "Lyrics",
  "4K", "HD" gibi ekleri yok say.
- Alt tür komşuluklarını tek tek düşün. Death metal ile black metal komşudur,
  grunge ile alternatif rock komşudur, house ile french house komşudur.
  Prog metal ile Türkçe pop komşu değildir.
- Maçın o ana kadarki gidişatına bak: müzik zaten bir yöne sürüklenmiş olabilir
  ve şarkı o sürüklenmenin makul bir devamı olabilir.
- Sahadaki hakem yanılmış olabilir. Kararı yalnızca gerçekten yanlışsa bozarsan
  doğru davranmış olursun; emin değilsen kararı bozmayacaksın.

matches alanı senin son kararındır: true ise şarkı uyuyor demektir ve kart
iptal edilir; false ise kart geçerli kalır.

Gerekçeni iki oyuncu ve bütün izleyiciler okuyacak; bir kez yazıyorsun, o yüzden
AYNI gerekçeyi üç dilde birden ver ve neden bu sonuca vardığını somut olarak yaz.

Cevabını SADECE şu JSON şemasında ver, başka hiçbir şey yazma:
{
  "matches": boolean,
  "confidence": number,
  "reason": { "tr": string, "en": string, "de": string },
  "artist": string|null,
  "song": string|null,
  "genre": string|null
}`;

/** The user-turn text for a video check: the same evidence, plus the first ruling. */
export function buildReviewPrompt(input: JudgeInput): string {
  const lines = ["İNCELENEN ŞARKI -> " + describe(input.current)];

  if (input.previous) {
    lines.push(`ÖNCEKİ ŞARKI    -> ${describe(input.previous)}`);
  } else if (input.genre) {
    lines.push(`Bu bir AÇILIŞ hamlesi. Maçın türü: "${input.genre}".`);
  }

  const history = input.history.slice(-6);
  if (history.length > 0) {
    lines.push("", "Maçın gidişatı (eskiden yeniye):");
    for (const [index, track] of history.entries()) lines.push(`  ${index + 1}. ${describe(track)}`);
  }

  lines.push(
    "",
    "Sahadaki hakem bu şarkıyı UYMUYOR saydı ve kart geçerli sayıldı.",
    "Bu kararı inceleyip son kararı sen ver.",
  );
  return lines.join("\n");
}
