import { BedrockChatReferee } from "./bedrock";

/**
 * The referee's second job: reading match chat for song tips.
 *
 * Giving away a song, an artist, or any other hint in chat costs the author
 * their account. With JUDGE_PROVIDER=bedrock the model decides, behind strict
 * safeguards (see BedrockChatReferee); "mock" never flags anyone. Links are
 * refused earlier, before a message ever reaches the referee.
 */

export interface ChatReviewInput {
  text: string;
  roomCode: string;
  authorIsPlayer: boolean;
}

export interface ChatReview {
  /** True when the message gives a song, artist, or other hint. */
  tip: boolean;
  reason: string | null;
}

export interface ChatReferee {
  readonly id: string;
  review(input: ChatReviewInput): Promise<ChatReview>;
}

class MockChatReferee implements ChatReferee {
  readonly id = "mock";

  async review(): Promise<ChatReview> {
    return { tip: false, reason: null };
  }
}

let cached: ChatReferee | null = null;

export function getChatReferee(): ChatReferee {
  if (cached) return cached;

  const provider = process.env.JUDGE_PROVIDER ?? "mock";
  switch (provider) {
    case "mock":
      cached = new MockChatReferee();
      break;
    case "bedrock":
      cached = new BedrockChatReferee();
      break;
    default:
      throw new Error(`Bilinmeyen JUDGE_PROVIDER: "${provider}". "mock" ya da "bedrock" olmalı.`);
  }
  return cached;
}
