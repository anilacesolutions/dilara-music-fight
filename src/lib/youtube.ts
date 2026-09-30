import "server-only";
import { GameError } from "./errors";
import { getDb } from "./mongodb";
import { MAX_TRACK_SECONDS } from "./rules";
import type { Track } from "./types";

const VIDEO_ID = /^[\w-]{11}$/;

/** Pulls the 11-character video id out of any common YouTube URL shape. */
export function parseVideoId(input: string): string | null {
  const trimmed = input.trim();

  // A bare id pasted on its own.
  if (VIDEO_ID.test(trimmed)) return trimmed;

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return VIDEO_ID.test(id) ? id : null;
  }

  if (host === "youtube.com" || host === "m.youtube.com" || host === "music.youtube.com") {
    const v = url.searchParams.get("v");
    if (v && VIDEO_ID.test(v)) return v;

    // /shorts/<id>, /embed/<id>, /live/<id>
    const match = url.pathname.match(/^\/(?:shorts|embed|live|v)\/([\w-]{11})/);
    if (match) return match[1];
  }

  return null;
}

interface OEmbedResponse {
  title?: string;
  author_name?: string;
}

async function fetchOEmbed(videoId: string): Promise<{ title: string; channel: string }> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const res = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(watchUrl)}&format=json`,
    { cache: "no-store" },
  );
  if (!res.ok) {
    throw new GameError("videoUnreachable");
  }

  const data = (await res.json()) as OEmbedResponse;
  return { title: data.title ?? "Bilinmeyen parça", channel: data.author_name ?? "Bilinmeyen kanal" };
}

interface DurationInfo {
  seconds: number | null;
  live: boolean;
}

/** Parses an ISO-8601 duration such as "PT8M14S". */
function parseIsoDuration(value: string): number | null {
  const match = value.match(/^P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/);
  if (!match) return null;
  const [days, hours, minutes, seconds] = match.slice(1).map((part) => Number(part ?? 0));
  return ((days * 24 + hours) * 60 + minutes) * 60 + seconds;
}

async function durationFromDataApi(videoId: string, apiKey: string): Promise<DurationInfo> {
  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${videoId}&key=${apiKey}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error(`YouTube Data API responded ${res.status}`);

  const data = (await res.json()) as {
    items?: { contentDetails?: { duration?: string }; snippet?: { liveBroadcastContent?: string } }[];
  };
  const item = data.items?.[0];
  if (!item) return { seconds: null, live: false };

  const iso = item.contentDetails?.duration;
  return {
    seconds: iso ? parseIsoDuration(iso) : null,
    live: (item.snippet?.liveBroadcastContent ?? "none") !== "none",
  };
}

const BROWSER_HEADERS = {
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36",
  // Without a consent choice YouTube answers datacenter addresses with an
  // interstitial that carries no video data at all.
  Cookie: "CONSENT=YES+cb; SOCS=CAISEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg",
} as const;

/** Pulls a length out of whatever shape the page or player response uses. */
function lengthFrom(text: string): DurationInfo | null {
  const seconds = text.match(/"lengthSeconds":\s*"?(\d+)"?/)?.[1];
  if (seconds !== undefined) {
    const value = Number(seconds);
    // A running stream reports a length of zero.
    return { seconds: value || null, live: value === 0 };
  }
  const ms = text.match(/"approxDurationMs":\s*"?(\d+)"?/)?.[1];
  if (ms !== undefined) return { seconds: Math.round(Number(ms) / 1000) || null, live: false };
  return null;
}

/**
 * Fallback when no YOUTUBE_API_KEY is set: reads the duration embedded in the
 * public watch page. Not an official API and may break without notice.
 */
export async function durationFromWatchPage(videoId: string): Promise<DurationInfo> {
  // bpctr and has_verified skip the consent and mature-content interstitials.
  const res = await fetch(
    `https://www.youtube.com/watch?v=${videoId}&bpctr=9999999999&has_verified=1&hl=en`,
    { cache: "no-store", headers: BROWSER_HEADERS },
  );
  if (!res.ok) return { seconds: null, live: false };
  return lengthFrom(await res.text()) ?? { seconds: null, live: false };
}

/**
 * Second fallback: the player endpoint the site's own client calls. It answers
 * with metadata where the watch page hands back a consent wall instead.
 */
export async function durationFromPlayer(videoId: string): Promise<DurationInfo> {
  const res = await fetch("https://www.youtube.com/youtubei/v1/player", {
    method: "POST",
    cache: "no-store",
    headers: { ...BROWSER_HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify({
      videoId,
      context: {
        client: { clientName: "WEB", clientVersion: "2.20240726.00.00", hl: "en", gl: "US" },
      },
    }),
  });
  if (!res.ok) return { seconds: null, live: false };

  const data = (await res.json()) as {
    videoDetails?: { lengthSeconds?: string; isLive?: boolean; isLiveContent?: boolean };
  };
  const details = data.videoDetails;
  if (!details?.lengthSeconds) return { seconds: null, live: details?.isLive ?? false };

  const seconds = Number(details.lengthSeconds);
  return { seconds: seconds || null, live: details.isLive === true || seconds === 0 };
}

/** The whole fallback chain, in the order it is worth paying for. */
async function durationWithoutApiKey(videoId: string): Promise<DurationInfo> {
  const page = await durationFromWatchPage(videoId);
  if (page.seconds || page.live) return page;
  return durationFromPlayer(videoId);
}

/** Resolves a YouTube link to a playable Track, enforcing the 10-minute limit. */
export async function resolveTrack(input: string): Promise<Track> {
  const videoId = parseVideoId(input);
  if (!videoId) throw new GameError("invalidLink");

  const apiKey = process.env.YOUTUBE_API_KEY;
  const [meta, duration] = await Promise.all([
    fetchOEmbed(videoId),
    apiKey ? durationFromDataApi(videoId, apiKey) : durationWithoutApiKey(videoId),
  ]);

  if (duration.live) throw new GameError("noLiveStreams");
  if (!duration.seconds) throw new GameError("durationUnreadable");
  if (duration.seconds > MAX_TRACK_SECONDS) {
    throw new GameError("trackTooLong", 400, { minutes: MAX_TRACK_SECONDS / 60 });
  }

  return {
    videoId,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    title: meta.title,
    channel: meta.channel,
    durationSeconds: duration.seconds,
    artist: null,
    song: null,
    genre: null,
  };
}

/* ------------------------------------------------------------------------- *
 * Searching inside the app
 * ------------------------------------------------------------------------- */

/** One playable result, already filtered down to something that can be sent. */
export interface TrackHit {
  videoId: string;
  title: string;
  channel: string;
  durationSeconds: number;
}

/**
 * How many results the player sees. We ask YouTube for more than this because
 * live streams and anything over the length limit are dropped before the list
 * is shown - offering a song that cannot be sent is worse than offering fewer.
 */
const SEARCH_RESULTS = 12;
const SEARCH_FETCH = 25;

/**
 * Search is the expensive call: one search costs 100 quota units against a
 * default allowance of 10,000 a day, while looking a video up costs 1. Two
 * hundred searches would take the whole day's budget and leave the match
 * unable to accept songs at all, so every query is answered from Mongo when we
 * have seen it before. In a game about Turkish pop the same handful of names
 * come up constantly, which is exactly the shape caching rewards. Entries live
 * a week, which Mongo enforces itself through the TTL index in `mongodb.ts`.
 */

/** The cache key: same words in the same order, whatever the spacing or case. */
function searchKey(query: string): string {
  return query.trim().replace(/\s+/g, " ").toLocaleLowerCase("tr");
}

interface VideoDetail {
  seconds: number | null;
  live: boolean;
  title: string;
  channel: string;
}

/** One `videos.list` call for a whole page of ids - 1 unit, not 1 per video. */
async function detailsFor(ids: string[], apiKey: string): Promise<Map<string, VideoDetail>> {
  const found = new Map<string, VideoDetail>();
  if (ids.length === 0) return found;

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${ids.join(",")}&key=${apiKey}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new GameError("searchUnavailable", 502);

  const data = (await res.json()) as {
    items?: {
      id?: string;
      contentDetails?: { duration?: string };
      snippet?: { title?: string; channelTitle?: string; liveBroadcastContent?: string };
    }[];
  };

  for (const item of data.items ?? []) {
    if (!item.id) continue;
    const iso = item.contentDetails?.duration;
    found.set(item.id, {
      seconds: iso ? parseIsoDuration(iso) : null,
      live: (item.snippet?.liveBroadcastContent ?? "none") !== "none",
      title: item.snippet?.title ?? "",
      channel: item.snippet?.channelTitle ?? "",
    });
  }
  return found;
}

/** Turns YouTube's 403 into the one thing the player needs to hear. */
async function searchFailure(res: Response): Promise<never> {
  const body = (await res.json().catch(() => null)) as
    | { error?: { errors?: { reason?: string }[] } }
    | null;
  const reason = body?.error?.errors?.[0]?.reason;
  if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") {
    throw new GameError("searchQuotaSpent", 503);
  }
  throw new GameError("searchUnavailable", 502);
}

/**
 * Songs matching a query, ready to be sent: embeddable, not live, and inside
 * the length limit. Restricted to YouTube's music category, which keeps
 * reaction videos and lyric-less uploads out of a list about songs.
 */
export async function searchTracks(query: string): Promise<TrackHit[]> {
  const key = searchKey(query);
  if (key.length < 2) return [];

  const db = await getDb();
  const cache = db.collection<{ key: string; hits: TrackHit[]; createdAt: Date }>("youtube_searches");

  const cached = await cache.findOne({ key });
  if (cached) return cached.hits;

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new GameError("searchUnavailable", 503);

  const params = new URLSearchParams({
    part: "snippet",
    type: "video",
    // Anything the player cannot actually play is noise in this list.
    videoEmbeddable: "true",
    videoSyndicated: "true",
    videoCategoryId: "10",
    maxResults: String(SEARCH_FETCH),
    q: key,
    key: apiKey,
  });

  const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`, { cache: "no-store" });
  if (!res.ok) await searchFailure(res);

  const data = (await res.json()) as { items?: { id?: { videoId?: string } }[] };
  const ids = (data.items ?? []).map((item) => item.id?.videoId).filter((id): id is string => Boolean(id));

  const details = await detailsFor(ids, apiKey);
  const hits: TrackHit[] = [];
  for (const videoId of ids) {
    const detail = details.get(videoId);
    if (!detail || detail.live) continue;
    if (detail.seconds === null || detail.seconds > MAX_TRACK_SECONDS) continue;
    hits.push({ videoId, title: detail.title, channel: detail.channel, durationSeconds: detail.seconds });
    if (hits.length === SEARCH_RESULTS) break;
  }

  // An empty answer is cached too: repeating a query that found nothing must
  // not cost another hundred units.
  await cache.updateOne(
    { key },
    { $set: { key, hits, createdAt: new Date() } },
    { upsert: true },
  );

  return hits;
}
