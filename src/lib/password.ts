import "server-only";
import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

const KEY_LENGTH = 64;
const COST = { N: 2 ** 15, r: 8, p: 1 };
// N=2^15 with r=8 needs ~33 MB, just over Node's 32 MB default ceiling.
const MAX_MEMORY = 64 * 1024 * 1024;

function derive(
  password: string,
  salt: Buffer,
  length: number,
  options: ScryptOptions,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, length, { ...options, maxmem: MAX_MEMORY }, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

/** Stored as scrypt$N$r$p$salt$hash so the cost can be raised later without breaking old hashes. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await derive(password, salt, KEY_LENGTH, COST);
  return ["scrypt", COST.N, COST.r, COST.p, salt.toString("base64"), hash.toString("base64")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;

  const expected = Buffer.from(hash, "base64");
  const actual = await derive(password, Buffer.from(salt, "base64"), expected.length, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
  });
  return timingSafeEqual(actual, expected);
}

let decoyHash: Promise<string> | null = null;

/** Spends the same time as a real check, so unknown nicknames don't answer faster. */
export async function verifyAgainstDecoy(password: string): Promise<void> {
  decoyHash ??= hashPassword(randomBytes(12).toString("hex"));
  await verifyPassword(password, await decoyHash);
}
