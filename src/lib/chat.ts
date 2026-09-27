import "server-only";
import { ObjectId, type WithId } from "mongodb";
import type { CurrentUser } from "./auth";
import { containsLink } from "./chat-rules";
import { GameError } from "./errors";
import { getChatReferee } from "./judge/chat";
import { deleteAccountForViolation } from "./moderation";
import {
  chatMessagesCollection,
  reportsCollection,
  usersCollection,
  type ChatMessageDoc,
} from "./mongodb";
import { maskProfanity } from "./profanity";
import { roomForChat } from "./rooms";
import { CHAT_COOLDOWN_MS, CHAT_MAX_LENGTH } from "./rules";
import type { ChatMessageView, RoomView } from "./types";

/** How much history someone sees when they open a room mid-match. */
const INITIAL_LIMIT = 60;

function toView(doc: WithId<ChatMessageDoc>, viewerId: string): ChatMessageView {
  return {
    id: doc._id.toHexString(),
    nickname: doc.nickname,
    role: doc.role,
    text: doc.text,
    createdAt: doc.createdAt.toISOString(),
    mine: doc.userId.toHexString() === viewerId,
  };
}

async function blockedBy(viewerId: string): Promise<ObjectId[]> {
  const users = await usersCollection();
  const viewer = await users.findOne({ _id: new ObjectId(viewerId) }, { projection: { blockedUserIds: 1 } });
  return viewer?.blockedUserIds ?? [];
}

/** Messages after `afterId` (or the latest few), minus anyone the viewer has blocked. */
export async function listMessages(
  room: RoomView,
  viewer: CurrentUser,
  afterId: string | null,
): Promise<ChatMessageView[]> {
  if (room.status !== "waiting" && room.status !== "active") return [];

  const [chat, hidden] = await Promise.all([chatMessagesCollection(), blockedBy(viewer.id)]);
  const base = { roomCode: room.code, ...(hidden.length > 0 ? { userId: { $nin: hidden } } : {}) };

  if (afterId && ObjectId.isValid(afterId)) {
    const newer = await chat
      .find({ ...base, _id: { $gt: new ObjectId(afterId) } })
      .sort({ _id: 1 })
      .limit(200)
      .toArray();
    return newer.map((doc) => toView(doc, viewer.id));
  }

  const latest = await chat.find(base).sort({ _id: -1 }).limit(INITIAL_LIMIT).toArray();
  return latest.reverse().map((doc) => toView(doc, viewer.id));
}

export async function postMessage(code: string, author: CurrentUser, rawText: string): Promise<ChatMessageView> {
  const { room, role } = await roomForChat(code, author);

  const text = rawText.replace(/\s+/g, " ").trim();
  if (!text) throw new GameError("emptyMessage", 422);
  if ([...text].length > CHAT_MAX_LENGTH) {
    throw new GameError("messageTooLong", 422, { max: CHAT_MAX_LENGTH });
  }
  if (containsLink(text)) throw new GameError("noLinks", 422);

  const chat = await chatMessagesCollection();
  const authorId = new ObjectId(author.id);
  const tooSoon = await chat.findOne({
    roomCode: room.code,
    userId: authorId,
    createdAt: { $gt: new Date(Date.now() - CHAT_COOLDOWN_MS) },
  });
  if (tooSoon) throw new GameError("tooFast", 429);

  // The referee reads the raw text, before profanity masking hides anything.
  const review = await getChatReferee().review({
    text,
    roomCode: room.code,
    authorIsPlayer: role !== "spectator",
  });
  if (review.tip) {
    await deleteAccountForViolation(author.id, {
      roomCode: room.code,
      reason: review.reason ?? "Sohbette şarkı ipucu verdi",
    });
    throw new GameError("tipDeleted", 403);
  }

  const doc: ChatMessageDoc = {
    roomCode: room.code,
    userId: authorId,
    nickname: author.nickname,
    role,
    text: maskProfanity(text),
    createdAt: new Date(),
  };
  const { insertedId } = await chat.insertOne(doc);
  return toView({ ...doc, _id: insertedId }, author.id);
}

async function findMessage(messageId: string): Promise<WithId<ChatMessageDoc>> {
  const chat = await chatMessagesCollection();
  const message = ObjectId.isValid(messageId) ? await chat.findOne({ _id: new ObjectId(messageId) }) : null;
  if (!message) throw new GameError("messageNotFound", 404);
  return message;
}

/** Files a report. The text is copied into it, since the chat itself disappears after the match. */
export async function reportMessage(messageId: string, reporter: CurrentUser): Promise<void> {
  const message = await findMessage(messageId);
  if (message.userId.toHexString() === reporter.id) {
    throw new GameError("cannotReportSelf", 409);
  }

  const reports = await reportsCollection();
  const reporterId = new ObjectId(reporter.id);
  const alreadyReported = await reports.findOne({
    reporterId,
    reportedUserId: message.userId,
    messageText: message.text,
    roomCode: message.roomCode,
  });
  if (alreadyReported) return;

  await reports.insertOne({
    reporterId,
    reportedUserId: message.userId,
    reportedNickname: message.nickname,
    roomCode: message.roomCode,
    messageText: message.text,
    createdAt: new Date(),
  });
}

/** Hides the author's messages from the blocker, everywhere. Returns the blocked nickname. */
export async function blockMessageAuthor(messageId: string, blocker: CurrentUser): Promise<string> {
  const message = await findMessage(messageId);
  if (message.userId.toHexString() === blocker.id) {
    throw new GameError("cannotBlockSelf", 409);
  }

  const users = await usersCollection();
  await users.updateOne({ _id: new ObjectId(blocker.id) }, { $addToSet: { blockedUserIds: message.userId } });
  return message.nickname;
}
