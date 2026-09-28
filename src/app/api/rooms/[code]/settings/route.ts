import { NextResponse } from "next/server";
import { z } from "zod";
import { errorResponse, requireApiUser } from "@/lib/api";
import { setRoomSettings } from "@/lib/rooms";

/** Both switches are optional, so a player can flip one without touching the other. */
const SettingsBody = z
  .object({
    spectatorsAllowed: z.boolean().optional(),
    spectatorChatAllowed: z.boolean().optional(),
  })
  .refine((body) => Object.keys(body).length > 0, { error: "No setting to change." });

export async function POST(request: Request, context: RouteContext<"/api/rooms/[code]/settings">) {
  try {
    const user = await requireApiUser();
    const { code } = await context.params;
    const settings = SettingsBody.parse(await request.json());
    return NextResponse.json({ room: await setRoomSettings(code, user, settings) });
  } catch (error) {
    return errorResponse(error);
  }
}
