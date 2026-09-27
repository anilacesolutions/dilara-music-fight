import { NextResponse, type NextRequest } from "next/server";
import { errorResponse, requireApiUser } from "@/lib/api";
import { listMessages } from "@/lib/chat";
import { getRoomView } from "@/lib/rooms";

/**
 * Polled by everyone in the room - players and spectators - for game state and
 * new chat in one round trip. `watch=1` marks a visitor as watching a room that
 * hasn't started; `after` is the id of the last chat message the page has.
 */
export async function GET(request: NextRequest, context: RouteContext<"/api/rooms/[code]">) {
  try {
    const user = await requireApiUser();
    const { code } = await context.params;
    const params = request.nextUrl.searchParams;

    const room = await getRoomView(code, user, { watching: params.get("watch") === "1" });
    const messages = await listMessages(room, user, params.get("after"));
    return NextResponse.json({ room, messages });
  } catch (error) {
    return errorResponse(error);
  }
}
