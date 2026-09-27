import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, requireApiUser } from "@/lib/api";
import { setEndVote } from "@/lib/rooms";

const EndBody = z.object({
  /** false withdraws an earlier "yeter" vote. */
  wantsToEnd: z.boolean(),
});

export async function POST(request: Request, context: RouteContext<"/api/rooms/[code]/end">) {
  try {
    const user = await requireApiUser();
    const { code } = await context.params;
    const { wantsToEnd } = EndBody.parse(await request.json());
    return NextResponse.json({ room: await setEndVote(code, user, wantsToEnd) });
  } catch (error) {
    return errorResponse(error);
  }
}
