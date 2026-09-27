import { NextResponse } from "next/server";
import { errorResponse, requireApiUser } from "@/lib/api";
import { blockMessageAuthor } from "@/lib/chat";

export async function POST(_request: Request, context: RouteContext<"/api/chat/[messageId]/block">) {
  try {
    const user = await requireApiUser();
    const { messageId } = await context.params;
    return NextResponse.json({ nickname: await blockMessageAuthor(messageId, user) });
  } catch (error) {
    return errorResponse(error);
  }
}
