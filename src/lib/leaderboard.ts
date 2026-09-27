import "server-only";
import { scoreEventsCollection } from "./mongodb";
import { periodStart, type LeaderboardPeriod } from "./time";

export interface LeaderboardEntry {
  rank: number;
  nickname: string;
  points: number;
}

export type Leaderboards = Record<LeaderboardPeriod, LeaderboardEntry[]>;

/**
 * Top players for the current calendar window. Sums the score ledger rather
 * than reading totals, so a day or week can be sliced out of all-time points.
 * Only positive totals make the board - it lists the best, not the most active.
 */
export async function getLeaderboard(period: LeaderboardPeriod, limit = 5): Promise<LeaderboardEntry[]> {
  const events = await scoreEventsCollection();

  const rows = await events
    .aggregate<{ nickname: string; points: number }>([
      { $match: { createdAt: { $gte: periodStart(period) } } },
      { $group: { _id: "$userId", points: { $sum: "$points" } } },
      { $match: { points: { $gt: 0 } } },
      { $sort: { points: -1, _id: 1 } },
      { $limit: limit },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $project: { _id: 0, points: 1, nickname: "$user.nickname" } },
    ])
    .toArray();

  return rows.map((row, index) => ({ rank: index + 1, nickname: row.nickname, points: row.points }));
}

export async function getLeaderboards(): Promise<Leaderboards> {
  const [daily, weekly, monthly] = await Promise.all([
    getLeaderboard("daily"),
    getLeaderboard("weekly"),
    getLeaderboard("monthly"),
  ]);
  return { daily, weekly, monthly };
}
