import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, requireApiUser } from "@/lib/api";
import { resolveTrack } from "@/lib/youtube";

/** Lets a player check title and length before committing a song to the match. */
export async function GET(request: NextRequest) {
  try {
    await requireApiUser();
    const track = await resolveTrack(request.nextUrl.searchParams.get("url") ?? "");
    return NextResponse.json({
      track: {
        videoId: track.videoId,
        title: track.title,
        channel: track.channel,
        durationSeconds: track.durationSeconds,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
