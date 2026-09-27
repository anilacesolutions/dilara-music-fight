import { NextResponse } from "next/server";
import { errorResponse, requireApiUser } from "@/lib/api";
import { cancelMatch } from "@/lib/rooms";

/** Leaving before the first song. Nothing is scored for either player. */
export async function POST(_request: Request, context: RouteContext<"/api/rooms/[code]/cancel">) {
  try {
    const user = await requireApiUser();
    const { code } = await context.params;
    return NextResponse.json({ room: await cancelMatch(code, user) });
  } catch (error) {
    return errorResponse(error);
  }
}
