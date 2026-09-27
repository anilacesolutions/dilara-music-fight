import "server-only";
import { MongoClient, type ClientSession, type Collection, type Db, type ObjectId } from "mongodb";
import type { ChatRole, Room } from "./types";

export interface UserDoc {
  firstName: string;
  lastName: string;
  nickname: string;
  /** Lower-cased copy for case-insensitive uniqueness and login. */
  nicknameLower: string;
  email: string;
  emailLower: string;
  birthDate: Date;
  passwordHash: string;
  avatar: string;
  genres: string[];
  totalPoints: number;
  /** People whose chat messages this user never sees. */
  blockedUserIds?: ObjectId[];
  kvkkAcceptedAt: Date;
  createdAt: Date;
}

export interface SessionDoc {
  /** SHA-256 of the cookie token. The raw token never touches the database. */
  tokenHash: string;
  userId: ObjectId;
  createdAt: Date;
  expiresAt: Date;
}

export type ScoreReason =
  | "song_match"
  | "song_mismatch"
  | "card_penalty"
  | "skip_penalty"
  | "win_bonus"
  | "draw_bonus";

/** One row per point change. Leaderboards sum these over a calendar window. */
export interface ScoreEventDoc {
  userId: ObjectId;
  points: number;
  reason: ScoreReason;
  roomCode: string;
  moveIndex: number | null;
  createdAt: Date;
}

/** Live match chat. Deleted when the match ends; a TTL index sweeps abandoned rooms. */
export interface ChatMessageDoc {
  roomCode: string;
  userId: ObjectId;
  nickname: string;
  role: ChatRole;
  text: string;
  createdAt: Date;
}

/** A spectator's latest check-in, used to count who is watching. */
export interface PresenceDoc {
  roomCode: string;
  userId: ObjectId;
  lastSeenAt: Date;
}

/** A reported chat message. The text is kept as evidence, since the chat itself is deleted. */
export interface ReportDoc {
  reporterId: ObjectId;
  reportedUserId: ObjectId;
  reportedNickname: string;
  roomCode: string;
  messageText: string;
  createdAt: Date;
}

/** What moderation did and why. Outlives the deleted account on purpose. */
export interface ModerationLogDoc {
  nickname: string;
  action: "account_deleted";
  reason: string;
  roomCode: string | null;
  createdAt: Date;
}

/**
 * Next.js reloads modules on every edit in dev, which would open a new pool
 * each time. Cache the client (and the one-off index setup) on globalThis.
 */
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoIndexesPromise?: Promise<void>;
};

function clientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not set. Copy .env.example to .env.local and fill it in.");
  }

  globalForMongo._mongoClientPromise ??= new MongoClient(uri).connect();
  return globalForMongo._mongoClientPromise;
}

async function ensureIndexes(db: Db): Promise<void> {
  await Promise.all([
    db.collection("users").createIndex({ nicknameLower: 1 }, { unique: true }),
    db.collection("users").createIndex({ emailLower: 1 }, { unique: true }),
    db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true }),
    // Mongo deletes sessions on its own once expiresAt passes.
    db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    db.collection("sessions").createIndex({ userId: 1 }),
    db.collection("rooms").createIndex({ code: 1 }, { unique: true }),
    db.collection("rooms").createIndex({ status: 1, "players.userId": 1 }),
    db.collection("score_events").createIndex({ createdAt: -1 }),
    db.collection("score_events").createIndex({ userId: 1, createdAt: -1 }),
    db.collection("chat_messages").createIndex({ roomCode: 1, _id: 1 }),
    // Safety net for rooms that never finish: chat never outlives a day.
    db.collection("chat_messages").createIndex({ createdAt: 1 }, { expireAfterSeconds: 86_400 }),
    db.collection("presence").createIndex({ roomCode: 1, userId: 1 }, { unique: true }),
    db.collection("presence").createIndex({ lastSeenAt: 1 }, { expireAfterSeconds: 300 }),
    db.collection("reports").createIndex({ createdAt: -1 }),
  ]);
}

export async function getDb(): Promise<Db> {
  const client = await clientPromise();
  const db = client.db(process.env.MONGODB_DB || "music_fight");

  globalForMongo._mongoIndexesPromise ??= ensureIndexes(db).catch((error: unknown) => {
    // Don't cache a failure forever; the next request tries again.
    globalForMongo._mongoIndexesPromise = undefined;
    throw error;
  });
  await globalForMongo._mongoIndexesPromise;

  return db;
}

export async function usersCollection(): Promise<Collection<UserDoc>> {
  return (await getDb()).collection<UserDoc>("users");
}

export async function sessionsCollection(): Promise<Collection<SessionDoc>> {
  return (await getDb()).collection<SessionDoc>("sessions");
}

export async function roomsCollection(): Promise<Collection<Room>> {
  return (await getDb()).collection<Room>("rooms");
}

export async function scoreEventsCollection(): Promise<Collection<ScoreEventDoc>> {
  return (await getDb()).collection<ScoreEventDoc>("score_events");
}

export async function chatMessagesCollection(): Promise<Collection<ChatMessageDoc>> {
  return (await getDb()).collection<ChatMessageDoc>("chat_messages");
}

export async function presenceCollection(): Promise<Collection<PresenceDoc>> {
  return (await getDb()).collection<PresenceDoc>("presence");
}

export async function reportsCollection(): Promise<Collection<ReportDoc>> {
  return (await getDb()).collection<ReportDoc>("reports");
}

export async function moderationLogCollection(): Promise<Collection<ModerationLogDoc>> {
  return (await getDb()).collection<ModerationLogDoc>("moderation_log");
}

/**
 * Runs `work` in a transaction. The driver may retry it on transient errors,
 * so it must only touch the database - and pass `session` to every call.
 */
export async function withTransaction<T>(work: (session: ClientSession) => Promise<T>): Promise<T> {
  await getDb(); // indexes can't be created inside a transaction
  const client = await clientPromise();
  const session = client.startSession();
  try {
    return await session.withTransaction(work);
  } finally {
    await session.endSession();
  }
}
