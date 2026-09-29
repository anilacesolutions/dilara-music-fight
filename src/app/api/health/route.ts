import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

/**
 * Deployment check. Says whether this instance can reach its database and, when
 * it cannot, which of the usual causes it looks like. Deliberately readable
 * without a session: it carries no secrets, only the shape of the environment.
 */
export const dynamic = "force-dynamic";

/** The cluster's first label, e.g. "musicfight" - enough to tell environments apart. */
function clusterName(uri: string | undefined): string | null {
  if (!uri) return null;
  const host = uri.replace(/^mongodb(\+srv)?:\/\/[^@]*@/, "").split(/[/?]/)[0];
  return host.split(".")[0] || null;
}

/**
 * Whether the configured referee can actually rule. A provider named without
 * its key answers every song with a 503, and a production deployment left on
 * the stand-in rules nonsense - both have happened, and both looked healthy.
 */
function refereeState(): { ok: boolean; provider: string; error?: string; hint?: string } {
  const provider = process.env.JUDGE_PROVIDER ?? "mock";

  if (provider === "openai" && !process.env.OPENAI_API_KEY) {
    return {
      ok: false,
      provider,
      error: "JUDGE_PROVIDER is openai but OPENAI_API_KEY is not set",
      hint: "Every song submission answers 503. Add the key and rebuild.",
    };
  }
  if (provider === "bedrock" && !process.env.AWS_BEARER_TOKEN_BEDROCK) {
    return {
      ok: false,
      provider,
      error: "JUDGE_PROVIDER is bedrock but AWS_BEARER_TOKEN_BEDROCK is not set",
      hint: "Every song submission answers 503. Add the key and rebuild.",
    };
  }
  if (provider === "mock" && process.env.NODE_ENV === "production") {
    return {
      ok: false,
      provider,
      error: "JUDGE_PROVIDER is mock in production",
      hint: "Songs are being ruled on by title similarity. Set JUDGE_PROVIDER=openai and OPENAI_API_KEY, then rebuild.",
    };
  }
  return { ok: true, provider };
}

/** Turns a driver error into the console setting that most likely caused it. */
function hintFor(message: string): string {
  if (/bad auth|authentication failed/i.test(message)) {
    return "Database user or password is wrong. If the password contains % # @ : / ? it must be percent-encoded in the URI.";
  }
  if (/ENOTFOUND|querySrv|getaddrinfo/i.test(message)) {
    return "The cluster address does not resolve. Check the host in MONGODB_URI, and that nothing truncated it at a '#'.";
  }
  if (/timed out|Server selection|SSL alert|tlsv1/i.test(message)) {
    return "Reached the network but not the cluster. Usually Atlas Network Access: allow this deployment's addresses (0.0.0.0/0 while testing), or the cluster is paused.";
  }
  return "Unrecognised database error - check the deployment logs.";
}

export async function GET() {
  const uri = process.env.MONGODB_URI;
  const env = {
    MONGODB_URI: uri ? "set" : "missing",
    MONGODB_DB: process.env.MONGODB_DB ?? "(unset, defaults to music_fight)",
    JUDGE_PROVIDER: process.env.JUDGE_PROVIDER ?? "(unset)",
    OPENAI_MODEL: process.env.OPENAI_MODEL ?? "(unset, defaults to gpt-5.4-mini)",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? "set" : "missing",
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY ? "set" : "missing",
    cluster: clusterName(uri),
  };

  if (!uri) {
    return NextResponse.json(
      {
        ok: false,
        env,
        mongo: { ok: false, error: "MONGODB_URI is not set", hint: "Add it to this environment's variables and redeploy." },
      },
      { status: 503 },
    );
  }

  const referee = refereeState();

  const startedAt = Date.now();
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return NextResponse.json(
      {
        ok: referee.ok,
        node: process.version,
        env,
        mongo: { ok: true, ms: Date.now() - startedAt },
        referee,
      },
      { status: referee.ok ? 200 : 503 },
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        ok: false,
        node: process.version,
        env,
        mongo: {
          ok: false,
          ms: Date.now() - startedAt,
          error: error instanceof Error ? error.name : "Error",
          detail: message.split("\n")[0].slice(0, 200),
          hint: hintFor(message),
        },
      },
      { status: 503 },
    );
  }
}
