import { NextResponse } from "next/server";
import { errorResponse, requireApiUser } from "@/lib/api";
import { reportMessage } from "@/lib/chat";

export async function POST(_request: Request, context: RouteContext<"/api/chat/[messageId]/report">) {
  try {
    const user = await requireApiUser();
    const { messageId } = await context.params;
    await reportMessage(messageId, user);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
