import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, requireApiUser } from "@/lib/api";
import { durationFromPlayer, durationFromWatchPage, parseVideoId } from "@/lib/youtube";

/**
 * Says how each duration source behaves from wherever this server runs, which
 * is the only place the answer matters: YouTube treats datacenter addresses
 * differently from a laptop. Needs a session, and reports no secrets.
 */
export const dynamic = "force-dynamic";

const HEADERS = {
  "Accept-Language": "en-US,en;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36",
  Cookie: "CONSENT=YES+cb; SOCS=CAISEwgDEgk0ODE3Nzk3MjQaAmVuIAEaBgiA_LyaBg",
} as const;

/** What the page calls itself - a consent wall says so in its <title>. */
function titleOf(html: string): string {
  return html.match(/<title>([^<]{0,120})</i)?.[1] ?? "(no title)";
}

/** The player endpoint answers different clients differently; find one it trusts. */
const CLIENTS = [
  { name: "ANDROID", version: "19.09.37", agent: "com.google.android.youtube/19.09.37 (Linux; U; Android 11) gzip" },
  { name: "IOS", version: "19.09.3", agent: "com.google.ios.youtube/19.09.3 (iPhone14,3; U; CPU iOS 15_6 like Mac OS X)" },
  { name: "TVHTML5_SIMPLY_EMBEDDED_PLAYER", version: "2.0", agent: "Mozilla/5.0 (PlayStation; PlayStation 4/12.00) AppleWebKit/605.1.15" },
] as const;

async function askClient(videoId: string, client: (typeof CLIENTS)[number]) {
  try {
    const res = await fetch("https://www.youtube.com/youtubei/v1/player", {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", "User-Agent": client.agent, "Accept-Language": "en-US,en;q=0.9" },
      body: JSON.stringify({
        videoId,
        context: { client: { clientName: client.name, clientVersion: client.version, hl: "en", gl: "US" } },
      }),
    });
    const data = (await res.json()) as {
      playabilityStatus?: { status?: string; reason?: string };
      videoDetails?: { lengthSeconds?: string; title?: string };
    };
    return {
      status: res.status,
      playability: data.playabilityStatus?.status ?? "(none)",
      reason: data.playabilityStatus?.reason ?? null,
      lengthSeconds: data.videoDetails?.lengthSeconds ?? null,
      title: data.videoDetails?.title ?? null,
    };
  } catch (error) {
    return { status: 0, playability: "threw", reason: error instanceof Error ? error.message : String(error) };
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireApiUser();
    const videoId = parseVideoId(request.nextUrl.searchParams.get("url") ?? "");
    if (!videoId) return NextResponse.json({ error: "invalid link" }, { status: 400 });

    const plain = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      cache: "no-store",
      headers: { "Accept-Language": HEADERS["Accept-Language"], "User-Agent": HEADERS["User-Agent"] },
    });
    const plainHtml = await plain.text();

    const dressed = await fetch(
      `https://www.youtube.com/watch?v=${videoId}&bpctr=9999999999&has_verified=1&hl=en`,
      { cache: "no-store", headers: HEADERS },
    );
    const dressedHtml = await dressed.text();

    return NextResponse.json({
      videoId,
      apiKey: process.env.YOUTUBE_API_KEY ? "set" : "missing",
      watchPagePlain: {
        status: plain.status,
        bytes: plainHtml.length,
        title: titleOf(plainHtml),
        hasLength: /"lengthSeconds"/.test(plainHtml),
      },
      watchPageWithConsent: {
        status: dressed.status,
        bytes: dressedHtml.length,
        title: titleOf(dressedHtml),
        hasLength: /"lengthSeconds"/.test(dressedHtml),
      },
      viaHelpers: {
        watchPage: await durationFromWatchPage(videoId),
        player: await durationFromPlayer(videoId),
      },
      clients: Object.fromEntries(
        await Promise.all(CLIENTS.map(async (client) => [client.name, await askClient(videoId, client)])),
      ),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
