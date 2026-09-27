import "server-only";
import { ObjectId } from "mongodb";
import {
  chatMessagesCollection,
  moderationLogCollection,
  presenceCollection,
  scoreEventsCollection,
  sessionsCollection,
  usersCollection,
} from "./mongodb";
import { forfeitMatchesOf } from "./rooms";

/**
 * The penalty for a song tip in chat: the account is deleted for good.
 *
 * Live matches end as a loss first, so opponents aren't left hanging. Then
 * everything tied to the account goes, including its points on the
 * leaderboards. A short log entry is kept as the record of why.
 */
export async function deleteAccountForViolation(
  userId: string,
  context: { roomCode: string | null; reason: string },
): Promise<void> {
  const id = new ObjectId(userId);
  const users = await usersCollection();
  const user = await users.findOne({ _id: id }, { projection: { nickname: 1 } });
  if (!user) return;

  await forfeitMatchesOf(userId);

  const [sessions, events, chat, presence, log] = await Promise.all([
    sessionsCollection(),
    scoreEventsCollection(),
    chatMessagesCollection(),
    presenceCollection(),
    moderationLogCollection(),
  ]);

  await Promise.all([
    sessions.deleteMany({ userId: id }),
    events.deleteMany({ userId: id }),
    chat.deleteMany({ userId: id }),
    presence.deleteMany({ userId: id }),
    users.updateMany({ blockedUserIds: id }, { $pull: { blockedUserIds: id } }),
  ]);
  await users.deleteOne({ _id: id });

  await log.insertOne({
    nickname: user.nickname,
    action: "account_deleted",
    reason: context.reason,
    roomCode: context.roomCode,
    createdAt: new Date(),
  });
}
