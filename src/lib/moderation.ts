import "server-only";
import { ObjectId } from "mongodb";
import { WARNINGS_BEFORE_RESTRICTION } from "./rules";
import { moderationLogCollection, usersCollection } from "./mongodb";
import { forfeitMatchesOf } from "./rooms";

export interface WarningOutcome {
  /** Warnings on the account after this one. */
  warnings: number;
  /** True when this warning was the one that closed the account off. */
  restricted: boolean;
}

/**
 * The penalty for a song tip in chat: a warning on the account, not deletion.
 *
 * The third one restricts the account instead - no matches, no watching - and
 * ends whatever match the person is in, so an opponent isn't left waiting on
 * somebody who can no longer play. Nothing is erased: the account, its points
 * and the record of why all stay.
 */
export async function warnForViolation(
  userId: string,
  context: { roomCode: string | null; reason: string },
): Promise<WarningOutcome> {
  const id = new ObjectId(userId);
  const users = await usersCollection();

  const updated = await users.findOneAndUpdate(
    { _id: id },
    { $inc: { warnings: 1 } },
    { returnDocument: "after", projection: { nickname: 1, warnings: 1, restrictedAt: 1 } },
  );
  if (!updated) return { warnings: 0, restricted: false };

  const warnings = updated.warnings ?? 1;
  const restricted = warnings >= WARNINGS_BEFORE_RESTRICTION;
  const log = await moderationLogCollection();

  await log.insertOne({
    nickname: updated.nickname,
    action: restricted ? "account_restricted" : "warning",
    reason: context.reason,
    roomCode: context.roomCode,
    createdAt: new Date(),
  });

  if (restricted && !updated.restrictedAt) {
    await users.updateOne({ _id: id }, { $set: { restrictedAt: new Date() } });
    // Ends live matches as a loss; the opponent shouldn't wait on someone who is out.
    await forfeitMatchesOf(userId);
  }

  return { warnings, restricted };
}
