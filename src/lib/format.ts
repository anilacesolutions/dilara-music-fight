/** Small display helpers, safe on server and client. */

export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function formatPoints(points: number): string {
  return points > 0 ? `+${points}` : String(points);
}
