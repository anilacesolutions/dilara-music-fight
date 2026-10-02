import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, requireApiUser } from "@/lib/api";
import { acceptListen, proposeListen } from "@/lib/rooms";

/** How much of each song has to be heard: one player asks, the other agrees. */
const ListenBody = z.discriminatedUnion("action", [
  z.object({ action: z.literal("propose"), ratio: z.number() }),
  z.object({ action: z.literal("accept") }),
]);

export async function POST(request: Request, context: RouteContext<"/api/rooms/[code]/listen">) {
  try {
    const user = await requireApiUser();
    const { code } = await context.params;
    const body = ListenBody.parse(await request.json());
    const room =
      body.action === "propose"
        ? await proposeListen(code, user, body.ratio)
        : await acceptListen(code, user);
    return NextResponse.json({ room });
  } catch (error) {
    return errorResponse(error);
  }
}
