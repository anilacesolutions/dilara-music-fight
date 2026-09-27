import "server-only";

/*
 * Starter profanity filter for Turkish and English chat. Offending words are
 * masked, not rejected, so a conversation keeps flowing. Matching is per word,
 * never per substring, so innocent words like "klasik" or "götürmek" pass.
 */

const EXACT = new Set([
  // Turkish
  "amk", "amq", "aq", "awk", "sik", "sikik", "sikim", "sikime", "siktim", "siktin", "yarak", "yarrak",
  "yarram", "göt", "götün", "götüne", "götünü", "götveren", "götlek", "oç", "orospu", "orosbu", "kahpe",
  "kahbe", "gavat", "pezevenk", "ibne", "ipne", "sürtük", "fahişe", "kerhane", "puşt", "pust", "amına",
  "amina", "amını", "ananı", "anani", "ananın", "ananin", "bacını",
  // English
  "fuck", "fucking", "fucker", "motherfucker", "shit", "bitch", "cunt", "dick", "asshole", "whore",
  "slut", "faggot", "nigger", "nigga", "retard",
]);

/** Stems that are offensive in every word they start. */
const PREFIXES = ["siker", "sikey", "siktir", "sikiş", "sikis", "yarrak", "orospu", "pezeven", "amına", "motherfuck", "fuck"];

const LEET: Record<string, string> = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", $: "s" };

function normalize(word: string): string {
  return word
    .toLocaleLowerCase("tr")
    .replace(/[013457@$]/g, (char) => LEET[char] ?? char);
}

function isProfane(word: string): boolean {
  const base = normalize(word);
  // "siiiik" and "fuuuck" should read the same as the plain word.
  const squeezed = base.replace(/(.)\1+/gu, "$1");
  return [base, squeezed].some(
    (candidate) => EXACT.has(candidate) || PREFIXES.some((prefix) => candidate.startsWith(prefix)),
  );
}

/** Returns the text with every offending word replaced by asterisks. */
export function maskProfanity(text: string): string {
  return text
    .split(/([^\p{L}\p{N}@$]+)/u)
    .map((part) => (part && isProfane(part) ? "*".repeat([...part].length) : part))
    .join("");
}
