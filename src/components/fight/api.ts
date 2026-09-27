/** Browser-side JSON helpers for the room endpoints. Errors carry the server's message. */

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** The session expired mid-match. Callers send the player to login and back. */
export class SessionExpiredError extends ApiError {}

/**
 * The server already writes its errors in the reader's language, so they are
 * passed through untouched. When there is no message at all the error is left
 * blank and the calling component fills in its own wording.
 */
async function readJson<T>(res: Response): Promise<T & { error?: string }> {
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (res.status === 401) throw new SessionExpiredError(data.error ?? "", 401);
  if (!res.ok) throw new ApiError(data.error ?? "", res.status);
  return data;
}

export async function getJson<T>(url: string): Promise<T> {
  return readJson<T>(await fetch(url, { cache: "no-store" }));
}

export async function postJson<T>(url: string, body: unknown): Promise<T> {
  return readJson<T>(
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}
