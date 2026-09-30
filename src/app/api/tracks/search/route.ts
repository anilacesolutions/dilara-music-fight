import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, requireApiUser } from "@/lib/api";
import { searchTracks } from "@/lib/youtube";

/**
 * Songs matching what the player typed, so nobody has to leave the match to
 * find a link. Behind a session on purpose: the quota this spends is shared by
 * everyone, and a signed-out caller has no match to send a song to anyway.
 */
export async function GET(request: NextRequest) {
  try {
    await requireApiUser();
    const hits = await searchTracks(request.nextUrl.searchParams.get("q") ?? "");
    return NextResponse.json({ hits });
  } catch (error) {
    return errorResponse(error);
  }
}
