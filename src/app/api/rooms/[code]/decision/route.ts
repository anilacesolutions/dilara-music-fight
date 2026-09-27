import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, requireApiUser } from "@/lib/api";
import { decide } from "@/lib/rooms";

const DecisionBody = z.object({
  /** null lets the song pass without a card. */
  card: z.enum(["yellow", "red"]).nullable(),
  /** Answer without listening, for SCORING.skipPenalty points. */
  skip: z.boolean().optional(),
});

export async function POST(request: Request, context: RouteContext<"/api/rooms/[code]/decision">) {
  try {
    const user = await requireApiUser();
    const { code } = await context.params;
    const { card, skip } = DecisionBody.parse(await request.json());
    return NextResponse.json({ room: await decide(code, user, card, skip ?? false) });
  } catch (error) {
    return errorResponse(error);
  }
}
