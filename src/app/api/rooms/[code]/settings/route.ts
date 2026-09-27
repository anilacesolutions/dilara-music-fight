import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, requireApiUser } from "@/lib/api";
import { setSpectatorsAllowed } from "@/lib/rooms";

const SettingsBody = z.object({
  spectatorsAllowed: z.boolean(),
});

export async function POST(request: Request, context: RouteContext<"/api/rooms/[code]/settings">) {
  try {
    const user = await requireApiUser();
    const { code } = await context.params;
    const { spectatorsAllowed } = SettingsBody.parse(await request.json());
    return NextResponse.json({ room: await setSpectatorsAllowed(code, user, spectatorsAllowed) });
  } catch (error) {
    return errorResponse(error);
  }
}
