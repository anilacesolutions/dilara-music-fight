/** Chat rules both the browser and the server check. */

export { CHAT_MAX_LENGTH } from "./rules";

// Music services by name, then anything that looks like a web address.
const LINK_PATTERN =
  /(https?:\/\/|www\.|youtu\.be|youtube\.com|spotify\.com|music\.apple\.com|deezer\.com|soundcloud\.com|\b[a-z0-9-]+\.(com|net|org|io|tv|me|co|app|fm)\b)/i;

/**
 * Links are refused outright: a pasted song link is the most direct kind of tip,
 * and refusing it up front means nobody loses an account over a mis-paste.
 */
export function containsLink(text: string): boolean {
  return LINK_PATTERN.test(text);
}
