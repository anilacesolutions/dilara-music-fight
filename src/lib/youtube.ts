import "server-only";
import { GameError } from "./errors";
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

/**
 * Fallback when no YOUTUBE_API_KEY is set: reads the duration embedded in the
 * public watch page. Not an official API and may break without notice.
 */
async function durationFromWatchPage(videoId: string): Promise<DurationInfo> {
  const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    cache: "no-store",
    headers: {
      "Accept-Language": "en-US,en;q=0.9",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36",
    },
  });
  if (!res.ok) return { seconds: null, live: false };

  const length = (await res.text()).match(/"lengthSeconds":"(\d+)"/)?.[1];
  const seconds = length ? Number(length) : null;
  // A running stream reports a length of zero.
  return { seconds: seconds || null, live: seconds === 0 };
}

/** Resolves a YouTube link to a playable Track, enforcing the 10-minute limit. */
export async function resolveTrack(input: string): Promise<Track> {
  const videoId = parseVideoId(input);
  if (!videoId) throw new GameError("invalidLink");

  const apiKey = process.env.YOUTUBE_API_KEY;
  const [meta, duration] = await Promise.all([
    fetchOEmbed(videoId),
    apiKey ? durationFromDataApi(videoId, apiKey) : durationFromWatchPage(videoId),
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
