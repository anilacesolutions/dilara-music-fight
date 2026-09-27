import { NextResponse } from "next/server";
import { errorResponse, requireApiUser } from "@/lib/api";
import { joinRoom } from "@/lib/rooms";

export async function POST(_request: Request, context: RouteContext<"/api/rooms/[code]/join">) {
  try {
    const user = await requireApiUser();
    const { code } = await context.params;
    return NextResponse.json({ room: await joinRoom(code, user) });
  } catch (error) {
    return errorResponse(error);
  }
}
