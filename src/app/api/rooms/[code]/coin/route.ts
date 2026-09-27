import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, requireApiUser } from "@/lib/api";
import { callCoin, throwCoin } from "@/lib/rooms";

const CoinBody = z.discriminatedUnion("action", [
  z.object({ action: z.literal("throw") }),
  z.object({ action: z.literal("call"), side: z.enum(["yazi", "tura"]) }),
]);

export async function POST(request: Request, context: RouteContext<"/api/rooms/[code]/coin">) {
  try {
    const user = await requireApiUser();
    const { code } = await context.params;
    const body = CoinBody.parse(await request.json());

    const room = body.action === "throw" ? await throwCoin(code, user) : await callCoin(code, user, body.side);
    return NextResponse.json({ room });
  } catch (error) {
    return errorResponse(error);
  }
}
