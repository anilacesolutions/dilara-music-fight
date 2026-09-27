import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, requireApiUser } from "@/lib/api";
import { submitMove } from "@/lib/rooms";

const MoveBody = z.object({
  url: z.string().trim().min(1, { error: "Bir YouTube linki gir." }),
});

export async function POST(request: Request, context: RouteContext<"/api/rooms/[code]/moves">) {
  try {
    const user = await requireApiUser();
    const { code } = await context.params;
    const { url } = MoveBody.parse(await request.json());
    return NextResponse.json({ room: await submitMove(code, user, url) });
  } catch (error) {
    return errorResponse(error);
  }
}
