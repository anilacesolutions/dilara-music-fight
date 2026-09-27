import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, requireApiUser } from "@/lib/api";
import { postMessage } from "@/lib/chat";

const ChatBody = z.object({
  // Length is enforced after trimming inside postMessage; this only caps the payload.
  text: z.string().max(2000, { error: "Mesaj çok uzun." }),
});

export async function POST(request: Request, context: RouteContext<"/api/rooms/[code]/chat">) {
  try {
    const user = await requireApiUser();
    const { code } = await context.params;
    const { text } = ChatBody.parse(await request.json());
    return NextResponse.json({ message: await postMessage(code, user, text) }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
