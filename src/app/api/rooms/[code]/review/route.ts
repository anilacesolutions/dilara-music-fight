import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, requireApiUser } from "@/lib/api";
import { requestReview, waiveReview } from "@/lib/rooms";

/** The player a card was shown to either sends it upstairs or lets it stand. */
const ReviewBody = z.object({ action: z.enum(["request", "accept"]) });

export async function POST(request: Request, context: RouteContext<"/api/rooms/[code]/review">) {
  try {
    const user = await requireApiUser();
    const { code } = await context.params;
    const { action } = ReviewBody.parse(await request.json());
    const room = action === "request" ? await requestReview(code, user) : await waiveReview(code, user);
    return NextResponse.json({ room });
  } catch (error) {
    return errorResponse(error);
  }
}
