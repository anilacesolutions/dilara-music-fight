import { NextResponse } from "next/server";
import { errorResponse, requireApiUser } from "@/lib/api";
import { surrender } from "@/lib/rooms";

export async function POST(_request: Request, context: RouteContext<"/api/rooms/[code]/surrender">) {
  try {
    const user = await requireApiUser();
    const { code } = await context.params;
    return NextResponse.json({ room: await surrender(code, user) });
  } catch (error) {
    return errorResponse(error);
  }
}
