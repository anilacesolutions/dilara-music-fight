import "server-only";
import { ObjectId } from "mongodb";
import { AVATARS, DEFAULT_AVATAR, GENRES, MAX_GENRES } from "./catalog";
import { GameError, isDuplicateKeyError } from "./errors";
import { usersCollection } from "./mongodb";
import { hashPassword, verifyAgainstDecoy, verifyPassword } from "./password";

/**
 * One spelling of a nickname for lookups. Non-ASCII letters can arrive in two
 * Unicode shapes - "ğ" as one character or as g plus a combining breve - and
 * they must land on the same account either way.
 */
const nicknameKey = (nickname: string): string => nickname.normalize("NFC").toLowerCase();

export interface NewUser {
  firstName: string;
  lastName: string;
  nickname: string;
  email: string;
  birthDate: Date;
  password: string;
  /** Validated by the signup action; feeds the genre options in every match. */
  genres: string[];
}

export type CreateUserResult =
  | { ok: true }
  | { ok: false; field: "nickname" | "email"; message: string };

export async function createUser(input: NewUser): Promise<CreateUserResult> {
  const users = await usersCollection();
  const now = new Date();

  try {
    await users.insertOne({
      firstName: input.firstName,
      lastName: input.lastName,
      nickname: input.nickname.normalize("NFC"),
      nicknameLower: nicknameKey(input.nickname),
      email: input.email,
      emailLower: input.email.toLowerCase(),
      birthDate: input.birthDate,
      passwordHash: await hashPassword(input.password),
      avatar: DEFAULT_AVATAR,
      genres: input.genres,
      totalPoints: 0,
      createdAt: now,
    });
    return { ok: true };
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;
    return error.keyPattern && "emailLower" in error.keyPattern
      ? { ok: false, field: "email", message: "Bu e-posta adresiyle zaten bir hesap var." }
      : { ok: false, field: "nickname", message: "Bu nickname alınmış, başka bir tane dene." };
  }
}

/** Returns the user id on success. A wrong nickname and a wrong password look identical. */
export async function authenticate(nickname: string, password: string): Promise<ObjectId | null> {
  const users = await usersCollection();
  const user = await users.findOne(
    { nicknameLower: nicknameKey(nickname) },
    { projection: { passwordHash: 1 } },
  );

  if (!user) {
    await verifyAgainstDecoy(password);
    return null;
  }
  return (await verifyPassword(password, user.passwordHash)) ? user._id : null;
}

/** Everything a profile page may show. Real name, e-mail and birth date never leave the server. */
export interface PublicProfile {
  nickname: string;
  avatar: string;
  genres: string[];
  totalPoints: number;
  memberSince: Date;
}

export async function getPublicProfile(nickname: string): Promise<PublicProfile | null> {
  const users = await usersCollection();
  const user = await users.findOne(
    { nicknameLower: nicknameKey(nickname) },
    { projection: { nickname: 1, avatar: 1, genres: 1, totalPoints: 1, createdAt: 1 } },
  );
  if (!user) return null;

  return {
    nickname: user.nickname,
    avatar: user.avatar,
    genres: user.genres,
    totalPoints: user.totalPoints,
    memberSince: user.createdAt,
  };
}

export async function updateProfile(userId: string, avatar: string, genres: string[]): Promise<void> {
  if (!AVATARS.some((option) => option.id === avatar)) {
    throw new GameError("invalidAvatar");
  }

  const unique = [...new Set(genres)];
  if (unique.some((id) => !GENRES.some((option) => option.id === id))) {
    throw new GameError("genreNotInList");
  }
  if (unique.length > MAX_GENRES) {
    throw new GameError("tooManyGenres", 400, { max: MAX_GENRES });
  }

  const users = await usersCollection();
  await users.updateOne({ _id: new ObjectId(userId) }, { $set: { avatar, genres: unique } });
}

/** Nicknames `userId` has blocked in chat, for their own profile page only. */
export async function listBlockedNicknames(userId: string): Promise<string[]> {
  const users = await usersCollection();
  const me = await users.findOne({ _id: new ObjectId(userId) }, { projection: { blockedUserIds: 1 } });
  const ids = me?.blockedUserIds ?? [];
  if (ids.length === 0) return [];

  const blocked = await users.find({ _id: { $in: ids } }, { projection: { nickname: 1 } }).toArray();
  return blocked.map((user) => user.nickname).sort((x, y) => x.localeCompare(y, "tr"));
}

export async function unblockUser(userId: string, nickname: string): Promise<void> {
  const users = await usersCollection();
  const target = await users.findOne({ nicknameLower: nicknameKey(nickname) }, { projection: { _id: 1 } });
  if (!target) return;
  await users.updateOne({ _id: new ObjectId(userId) }, { $pull: { blockedUserIds: target._id } });
}
