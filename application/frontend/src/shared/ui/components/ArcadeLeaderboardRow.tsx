import { Card } from "./Card";
import { composeClasses } from "../utils/composeClasses";

export type ArcadeLeaderboardRowTone =
  | "primary"
  | "secondary"
  | "accent"
  | "neutral";

const WRAPPER_CLASSES = composeClasses(
  "flex items-center justify-between gap-4 sm:gap-6",
  "transition-transform duration-300 group"
);

const POSITION_BASE_CLASSES = composeClasses(
  "font-display text-3xl sm:text-4xl font-black",
  "drop-shadow-[0_0_16px_rgba(255,255,255,0.35)]"
);

const POSITION_TONE_MAP: Record<ArcadeLeaderboardRowTone, string> = {
  primary: "text-primary-900 dark:text-primary-100",
  secondary: "text-secondary-900 dark:text-secondary-100",
  accent: "text-accent-900 dark:text-accent-100",
  neutral: "text-dark-500 dark:text-light-200",
};

const NAME_CLASSES = composeClasses(
  "flex-1 min-w-0 font-display uppercase",
  "text-xl sm:text-2xl tracking-[0.24em] text-dark-500 dark:text-light-100",
  "truncate drop-shadow-[0_0_10px_rgba(255,255,255,0.25)]"
);

const POINTS_BASE_CLASSES = composeClasses(
  "inline-flex items-center gap-2 rounded-lg border px-4 py-2",
  "font-black uppercase tracking-[0.28em] text-xs sm:text-sm",
  "transition-transform duration-200 group-hover:scale-105"
);

const POINTS_TONE_MAP: Record<ArcadeLeaderboardRowTone, string> = {
  primary:
    "bg-primary-500/12 text-primary-900 border-primary-400/50 dark:text-primary-100",
  secondary:
    "bg-secondary-500/12 text-secondary-900 border-secondary-400/50 dark:text-secondary-100",
  accent:
    "bg-accent-500/12 text-accent-900 border-accent-400/45 dark:text-accent-100",
  neutral:
    "bg-light-200/70 text-dark-500 border-dark-300/30 dark:bg-light-500/10 dark:text-light-100 dark:border-light-400/40",
};

export interface ArcadeLeaderboardRowProps {
  position: number;
  username: string;
  points: number;
  tone?: ArcadeLeaderboardRowTone;
  animationOrder?: number;
}

export function ArcadeLeaderboardRow({
  position,
  username,
  points,
  tone = "accent",
  animationOrder,
}: ArcadeLeaderboardRowProps) {
  const animationStyle =
    typeof animationOrder === "number"
      ? { animationDelay: `${animationOrder * 0.1}s` }
      : undefined;

  return (
    <div style={animationStyle} data-arcade-leaderboard-row="true">
      <Card
        surface="glass"
        tone={tone === "neutral" ? "neutral" : tone}
        padding="md"
        border="regular"
        elevation="glow"
        motion="slide-up"
      >
        <div className={WRAPPER_CLASSES}>
          <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
            <span
              className={composeClasses(
                POSITION_BASE_CLASSES,
                POSITION_TONE_MAP[tone]
              )}
            >
              #{position}
            </span>
            <span className={NAME_CLASSES}>{username}</span>
          </div>
          <span
            className={composeClasses(
              POINTS_BASE_CLASSES,
              POINTS_TONE_MAP[tone]
            )}
          >
            {points} pts
          </span>
        </div>
      </Card>
    </div>
  );
}

export default ArcadeLeaderboardRow;
