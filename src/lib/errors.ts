import type { ErrorArgs, ErrorKey } from "@/i18n/errors";

/**
 * A refusal the player is allowed to read: rule violations, bad links, full
 * rooms. It carries a message *key* rather than a sentence, because the engine
 * has no idea which language the reader wants; the API boundary translates it.
 * Anything that isn't a GameError becomes a generic message, so internal
 * details (connection strings, driver errors) never reach the client.
 */
export class GameError<K extends ErrorKey = ErrorKey> extends Error {
  readonly key: K;
  readonly status: number;
  readonly params: unknown;

  constructor(key: K, status = 400, ...args: ErrorArgs<K>) {
    // The key stands in as the message, so a stray console.log still says something.
    super(key);
    this.name = "GameError";
    this.key = key;
    this.status = status;
    this.params = args[0];
  }
}

/** Mongo's E11000: a unique index rejected the write. */
export function isDuplicateKeyError(
  error: unknown,
): error is { code: 11000; keyPattern?: Record<string, unknown> } {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: unknown }).code === 11000
  );
}
