import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, requireApiUser } from "@/lib/api";
import { answerGenre, proposeGenre } from "@/lib/rooms";

const GenreBody = z.discriminatedUnion("action", [
  /** The toss loser names the genre. */
  z.object({ action: z.literal("propose"), genre: z.string().min(1) }),
  /** The toss winner accepts it, or spends their one refusal. */
  z.object({ action: z.literal("accept") }),
  z.object({ action: z.literal("veto") }),
]);

export async function POST(request: Request, context: RouteContext<"/api/rooms/[code]/genre">) {
  try {
    const user = await requireApiUser();
    const { code } = await context.params;
    const body = GenreBody.parse(await request.json());

    const room =
      body.action === "propose"
        ? await proposeGenre(code, user, body.genre)
        : await answerGenre(code, user, body.action === "accept");
    return NextResponse.json({ room });
  } catch (error) {
    return errorResponse(error);
  }
}
