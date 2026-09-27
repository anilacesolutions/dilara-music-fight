import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/link";
import { translateError } from "@/i18n/errors";
import { currentLocale, getSite } from "@/i18n/server";
import { requireUser } from "@/lib/auth";
import { listMessages } from "@/lib/chat";
import { GameError } from "@/lib/errors";
import { getRoomView, normalizeRoomCode } from "@/lib/rooms";
import type { ChatMessageView, RoomView } from "@/lib/types";
import RoomClient from "./RoomClient";

export async function generateMetadata({ params }: PageProps<"/[locale]/room/[code]">): Promise<Metadata> {
  const { code } = await params;
  return { title: (await getSite()).roomPage.metaTitle(code.toUpperCase()) };
}

export default async function RoomPage({ params, searchParams }: PageProps<"/[locale]/room/[code]">) {
  const { code: rawCode } = await params;
  const code = normalizeRoomCode(rawCode);
  if (!code) notFound();

  // ?watch=1 comes from "İzleyici Ol": watch straight away instead of being offered the seat.
  const watching = (await searchParams).watch === "1";

  // Invite links work for guests too: log in (or sign up), then land back here.
  const user = await requireUser(`/room/${code}${watching ? "?watch=1" : ""}`);
  const locale = await currentLocale();

  let room: RoomView;
  let messages: ChatMessageView[];
  try {
    room = await getRoomView(code, user, { watching });
    messages = await listMessages(room, user, null);
  } catch (error) {
    if (error instanceof GameError && error.status === 404) notFound();
    if (error instanceof GameError && error.status === 403) {
      const site = await getSite();
      return (
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
          <p className="text-5xl">🔒</p>
          <h1 className="mt-4 font-display text-xl font-bold">
            {translateError(locale, error.key, error.params)}
          </h1>
          <p className="mt-2 text-sm text-muted">{site.roomPage.closedNote}</p>
          <Link href="/lobby" className="btn btn-ghost mt-8">
            {site.roomPage.backToLobby}
          </Link>
        </main>
      );
    }
    throw error;
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return (
    <RoomClient
      initialRoom={room}
      initialMessages={messages}
      initiallyWatching={watching}
      // The invite carries the host's language; the visitor can switch in one click.
      inviteUrl={`${protocol}://${host}/${locale}/room/${code}`}
    />
  );
}
