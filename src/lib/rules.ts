/**
 * Every number the game is balanced on. Safe to import from client code,
 * except listenRatio(), whose env override only exists on the server.
 */

export const SCORING = {
  /** The opening song is judged against the genre both players settled on, so it scores like any other. */
  match: 30,
  mismatch: -20,
  /** Extra penalty on the song's owner, only when the referee agrees with the card. */
  cardPenalty: { yellow: -5, red: -10 },
  /** Charged to a player who answers without listening to the opponent's song. No limit per match. */
  skipPenalty: -5,
  winBonus: 10,
  drawBonus: 5,
  /** Fights against AI pay half. "Fight with AI" and AI-vs-AI watching are still placeholders. */
  aiMultiplier: 0.5,
} as const;

export const CARDS_PER_PLAYER = { yellow: 2, red: 1 } as const;

/**
 * Football's rule: an upheld red ends the match on the spot, and so does a
 * second upheld yellow. A card the referee waves away books nobody.
 */
export const YELLOWS_BEFORE_SENDING_OFF = 2;

/**
 * Chat violations tolerated before an account is closed off. The first two are
 * warnings; the third restricts the account instead of deleting it.
 */
export const WARNINGS_BEFORE_RESTRICTION = 3;

/**
 * The video check. A card the referee upheld can be sent upstairs once per
 * player per match; the second opinion is taken on more evidence and its word
 * is final, so the card only takes effect after the window closes.
 */
export const REVIEWS_PER_PLAYER = 1;
export const REVIEW_SECONDS = 45;

export const MAX_TRACK_SECONDS = 10 * 60;

export const MIN_SIGNUP_AGE = 18;

/** Genres a new account must pick, so every match has common ground to start from. */
export const MIN_SIGNUP_GENRES = 3;

/**
 * Time for each step of the pre-match setup: throwing the coin, calling a side,
 * naming the genre, answering the proposal. When it runs out the server decides.
 */
export const SETUP_SECONDS = 120;

/** How many genres are offered, once the two players' lists are crossed. */
export const GENRE_OPTIONS = 5;

/** Songs each player must send before the match can be ended by agreement or pay a bonus. */
export const MIN_SONGS_PER_PLAYER = 3;

/** Time the player on turn has to send a song once the listening window is over. */
export const TURN_SECONDS = 5 * 60;

/** Slack before a timeout is enforced, so a song sent in the final second still lands. */
export const TURN_GRACE_MS = 10_000;

/** A room nobody joins closes after this long. */
export const WAITING_ROOM_MINUTES = 30;

export const CHAT_MAX_LENGTH = 300;

/** Minimum gap between two messages from the same person. */
export const CHAT_COOLDOWN_MS = 1000;

/** A spectator counts as watching if their page checked in this recently. */
export const PRESENCE_WINDOW_SECONDS = 20;

/** Absorbs polling lag between a move landing and the opponent's player starting. */
export const LISTEN_GRACE_MS = 3000;

/**
 * Share of the opponent's song you must hear before you may answer, when the
 * two players never settle on one. Testers found a compulsory 80% tiring, so
 * the match now opens on 60% and the pair can move it themselves.
 */
export const DEFAULT_LISTEN_RATIO = 0.6;

/** The only shares the two of them may agree on, as the slider offers them. */
export const LISTEN_RATIO_STEPS = [0, 0.2, 0.4, 0.6, 0.8, 1] as const;

export function isListenRatio(value: number): boolean {
  return LISTEN_RATIO_STEPS.some((step) => Math.abs(step - value) < 1e-9);
}

/**
 * The share to use when a room never recorded a choice: older matches, and
 * anything settled by the clock. MF_LISTEN_RATIO shrinks it for local testing.
 */
export function listenRatio(): number {
  if (process.env.NODE_ENV === "production") return DEFAULT_LISTEN_RATIO;
  const override = Number(process.env.MF_LISTEN_RATIO);
  return override > 0 && override <= 1 ? override : DEFAULT_LISTEN_RATIO;
}
