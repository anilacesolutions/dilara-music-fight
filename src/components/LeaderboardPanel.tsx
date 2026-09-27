import { Link } from "@/i18n/link";
import { getUi } from "@/i18n/server";
import type { LeaderboardEntry } from "@/lib/leaderboard";

const MEDALS = ["🥇", "🥈", "🥉"];
const SLOTS = 5;

interface LeaderboardPanelProps {
  title: string;
  subtitle: string;
  entries: LeaderboardEntry[];
  tone: "flare" | "volt" | "pulse";
}

const toneClasses = {
  flare: "from-flare-500/25 text-flare-300",
  volt: "from-volt-500/25 text-volt-300",
  pulse: "from-pulse-500/25 text-pulse-300",
};

export async function LeaderboardPanel({ title, subtitle, entries, tone }: LeaderboardPanelProps) {
  const ui = await getUi();

  return (
    <section className="panel overflow-hidden">
      <header className={`bg-gradient-to-b to-transparent px-5 pb-3 pt-5 ${toneClasses[tone]}`}>
        <h3 className="font-display text-base font-bold">{title}</h3>
        <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
      </header>

      <ol className="divide-y divide-line/50 px-2 pb-2">
        {Array.from({ length: SLOTS }, (_, index) => {
          const entry = entries[index];
          return (
            <li key={index} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
              <span className="w-6 text-center font-mono text-sm text-muted">
                {entry && index < MEDALS.length ? MEDALS[index] : index + 1}
              </span>
              {entry ? (
                <>
                  <Link
                    href={`/profile/${entry.nickname}`}
                    className="min-w-0 flex-1 truncate text-sm font-semibold hover:underline"
                  >
                    {entry.nickname}
                  </Link>
                  <span className="font-mono text-sm font-bold tabular-nums">{entry.points}</span>
                </>
              ) : (
                <span className="flex-1 text-sm text-ink-600">{index === 0 ? ui.leaderboard.empty : "—"}</span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
