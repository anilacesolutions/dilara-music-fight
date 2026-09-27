import { NextResponse } from "next/server";
import { errorResponse, requireApiUser } from "@/lib/api";
import { createRoom } from "@/lib/rooms";

/** Opens a friend fight with the caller as host. */
export async function POST() {
  try {
    const user = await requireApiUser();
    const code = await createRoom(user);
    return NextResponse.json({ code }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
