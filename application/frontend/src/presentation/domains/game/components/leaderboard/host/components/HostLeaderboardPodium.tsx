import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { LeaderboardEntry } from "../../../../../../../domains/game/types";
import { ArcadeCardGrid } from "../../../../../../../presentation/shared/ui/components";
import { composeClasses } from "../../../../../../shared/utils/composeClasses";
import type { HostLeaderboardAnimationStage } from "../../constants";

interface HostLeaderboardPodiumProps {
  leaderboard: LeaderboardEntry[];
  animationStage: HostLeaderboardAnimationStage;
}

const PODIUM_CONTAINER_BASE = composeClasses(
  "group relative flex w-full flex-col items-center justify-end gap-4",
  "text-center"
);

const PODIUM_CARD_BASE_CLASSES = composeClasses(
  "relative flex w-full flex-col items-center justify-center overflow-hidden",
  "rounded-3xl border-2 px-6 py-8 sm:px-8 sm:py-10",
  "bg-dark-600/70 backdrop-blur-lg transition-transform duration-300",
  "shadow-[0_25px_45px_rgba(10,10,31,0.45)] group-hover:-translate-y-1"
);

const PODIUM_NAME_BASE_CLASSES = composeClasses(
  "mt-4 w-full truncate font-display uppercase tracking-[0.28em]",
  "text-light-100 drop-shadow-[0_0_18px_rgba(255,255,255,0.35)]"
);

const PODIUM_POINTS_BASE_CLASSES = composeClasses(
  "mt-3 inline-flex items-center rounded-full border px-4 py-1.5",
  "font-black uppercase tracking-[0.32em] text-xs sm:text-sm",
  "transition-transform duration-200 group-hover:scale-105"
);

const PEDESTAL_BASE_CLASSES = composeClasses(
  "relative mt-6 flex w-full items-end justify-center overflow-hidden",
  "rounded-[2rem] border-2 bg-dark-700/85 px-6 pb-6 pt-8",
  "shadow-[inset_0_12px_45px_rgba(0,0,0,0.45)] backdrop-blur-lg",
  "transition-transform duration-300 group-hover:-translate-y-0.5"
);

const PEDESTAL_NUMBER_BASE_CLASSES = composeClasses(
  "font-display text-4xl sm:text-5xl font-black tracking-[0.35em]",
  "drop-shadow-[0_0_16px_rgba(255,255,255,0.35)]"
);

const PEDESTAL_GLOW_OVERLAY_CLASSES = composeClasses(
  "pointer-events-none absolute inset-0 -z-10",
  "rounded-[2.5rem] bg-gradient-to-br from-primary-500/35 via-secondary-500/20 to-accent-500/35",
  "opacity-70 blur-3xl"
);

const SECOND_PLACE_CONTAINER_CLASSES = composeClasses(
  PODIUM_CONTAINER_BASE,
  "sm:col-start-1"
);

const SECOND_PLACE_CARD_CLASSES = composeClasses(
  PODIUM_CARD_BASE_CLASSES,
  "border-secondary-400/45",
  "bg-gradient-to-br from-secondary-500/12 via-dark-600/75 to-dark-700/85",
  "shadow-neon-secondary"
);

const SECOND_PLACE_MEDAL_CLASSES = composeClasses(
  "text-4xl sm:text-5xl",
  "animate-scale-in drop-shadow-[0_0_14px_rgba(255,255,255,0.35)]"
);

const SECOND_PLACE_NAME_CLASSES = composeClasses(
  PODIUM_NAME_BASE_CLASSES,
  "text-2xl text-secondary-100"
);

const SECOND_PLACE_POINTS_CLASSES = composeClasses(
  PODIUM_POINTS_BASE_CLASSES,
  "border-secondary-400/35 bg-secondary-500/15 text-secondary-50"
);

const SECOND_PLACE_PEDESTAL_CLASSES = composeClasses(
  PEDESTAL_BASE_CLASSES,
  "h-28 sm:h-32 border-secondary-400/35"
);

const SECOND_PLACE_NUMBER_CLASSES = composeClasses(
  PEDESTAL_NUMBER_BASE_CLASSES,
  "text-secondary-100"
);

const FIRST_PLACE_CONTAINER_CLASSES = composeClasses(
  PODIUM_CONTAINER_BASE,
  "sm:col-start-2 sm:-translate-y-2"
);

const FIRST_PLACE_CARD_CLASSES = composeClasses(
  PODIUM_CARD_BASE_CLASSES,
  "border-primary-400/50",
  "bg-gradient-to-br from-primary-500/22 via-dark-600/75 to-secondary-500/18",
  "shadow-neon"
);

const FIRST_PLACE_OVERLAY_CLASSES = composeClasses(
  "pointer-events-none absolute inset-0",
  "bg-gradient-to-br from-primary-400/25 via-transparent to-accent-400/25",
  "opacity-80 mix-blend-screen animate-pulse-slow"
);

const FIRST_PLACE_CONTENT_CLASSES = "relative flex flex-col items-center";

const FIRST_PLACE_CROWN_CLASSES = composeClasses(
  "text-5xl sm:text-6xl",
  "drop-shadow-[0_0_20px_rgba(255,255,255,0.45)]"
);

const FIRST_PLACE_NAME_CLASSES = composeClasses(
  PODIUM_NAME_BASE_CLASSES,
  "text-3xl sm:text-4xl text-primary-50"
);

const FIRST_PLACE_POINTS_CLASSES = composeClasses(
  PODIUM_POINTS_BASE_CLASSES,
  "border-primary-400/40 bg-primary-500/15 text-primary-100"
);

const FIRST_PLACE_PEDESTAL_CLASSES = composeClasses(
  PEDESTAL_BASE_CLASSES,
  "mt-8 h-36 sm:h-44 border-primary-400/45"
);

const FIRST_PLACE_NUMBER_CLASSES = composeClasses(
  PEDESTAL_NUMBER_BASE_CLASSES,
  "text-primary-50"
);

const THIRD_PLACE_CONTAINER_CLASSES = composeClasses(
  PODIUM_CONTAINER_BASE,
  "sm:col-start-3"
);

const THIRD_PLACE_CARD_CLASSES = composeClasses(
  PODIUM_CARD_BASE_CLASSES,
  "border-accent-400/35",
  "bg-gradient-to-br from-accent-500/12 via-dark-600/75 to-dark-700/85",
  "shadow-neon-accent"
);

const THIRD_PLACE_MEDAL_CLASSES = composeClasses(
  "text-4xl sm:text-5xl",
  "animate-scale-in drop-shadow-[0_0_14px_rgba(255,255,255,0.35)]"
);

const THIRD_PLACE_NAME_CLASSES = composeClasses(
  PODIUM_NAME_BASE_CLASSES,
  "text-xl sm:text-2xl text-accent-100"
);

const THIRD_PLACE_POINTS_CLASSES = composeClasses(
  PODIUM_POINTS_BASE_CLASSES,
  "border-accent-400/35 bg-accent-500/15 text-accent-100"
);

const THIRD_PLACE_PEDESTAL_CLASSES = composeClasses(
  PEDESTAL_BASE_CLASSES,
  "h-24 sm:h-28 border-accent-400/30"
);

const THIRD_PLACE_NUMBER_CLASSES = composeClasses(
  PEDESTAL_NUMBER_BASE_CLASSES,
  "text-accent-100"
);

export function HostLeaderboardPodium({
  leaderboard,
  animationStage,
}: HostLeaderboardPodiumProps) {
  const { t } = useTranslation();

  const [firstPlace, secondPlace, thirdPlace] = useMemo(() => {
    const [first, second, third] = leaderboard;
    return [first ?? null, second ?? null, third ?? null];
  }, [leaderboard]);

  if (!firstPlace && !secondPlace && !thirdPlace) {
    return null;
  }

  return (
    <ArcadeCardGrid layout="triple" bottomSpacing="none">
      {secondPlace && animationStage >= 3 ? (
        <div
          className={SECOND_PLACE_CONTAINER_CLASSES}
          style={{ animation: "slideUp 0.7s ease-out, scaleIn 0.5s ease-out" }}
        >
          <div className={SECOND_PLACE_CARD_CLASSES}>
            <div
              className={SECOND_PLACE_MEDAL_CLASSES}
              style={{ animationDelay: "0.3s" }}
              aria-hidden
            >
              🥈
            </div>
            <div className={SECOND_PLACE_NAME_CLASSES}>
              {secondPlace.username}
            </div>
            <div className={SECOND_PLACE_POINTS_CLASSES}>
              {t("game.hostLeaderboard.points.suffix", {
                count: secondPlace.totalPoints,
              })}
            </div>
          </div>
          <div className={SECOND_PLACE_PEDESTAL_CLASSES}>
            <span className={SECOND_PLACE_NUMBER_CLASSES}>2</span>
          </div>
        </div>
      ) : null}

      {firstPlace && animationStage >= 2 ? (
        <div
          className={FIRST_PLACE_CONTAINER_CLASSES}
          style={{
            animation:
              "slideUp 0.7s ease-out, scaleIn 0.5s ease-out, float 3s ease-in-out infinite 0.7s",
          }}
        >
          <div className={FIRST_PLACE_CARD_CLASSES}>
            <div
              className={FIRST_PLACE_OVERLAY_CLASSES}
              style={{ animationDuration: "2s" }}
            />
            <div className={FIRST_PLACE_CONTENT_CLASSES}>
              <div className={FIRST_PLACE_CROWN_CLASSES} aria-hidden>
                👑
              </div>
              <div className={FIRST_PLACE_NAME_CLASSES}>
                {firstPlace.username}
              </div>
              <div className={FIRST_PLACE_POINTS_CLASSES}>
                {t("game.hostLeaderboard.points.celebration", {
                  count: firstPlace.totalPoints,
                })}
              </div>
            </div>
          </div>
          <div className={FIRST_PLACE_PEDESTAL_CLASSES}>
            <div className={PEDESTAL_GLOW_OVERLAY_CLASSES} aria-hidden />
            <span className={FIRST_PLACE_NUMBER_CLASSES}>1</span>
          </div>
        </div>
      ) : null}

      {thirdPlace && animationStage >= 4 ? (
        <div
          className={THIRD_PLACE_CONTAINER_CLASSES}
          style={{ animation: "slideUp 0.7s ease-out, scaleIn 0.5s ease-out" }}
        >
          <div className={THIRD_PLACE_CARD_CLASSES}>
            <div
              className={THIRD_PLACE_MEDAL_CLASSES}
              style={{ animationDelay: "0.6s" }}
              aria-hidden
            >
              🥉
            </div>
            <div className={THIRD_PLACE_NAME_CLASSES}>
              {thirdPlace.username}
            </div>
            <div className={THIRD_PLACE_POINTS_CLASSES}>
              {t("game.hostLeaderboard.points.suffix", {
                count: thirdPlace.totalPoints,
              })}
            </div>
          </div>
          <div className={THIRD_PLACE_PEDESTAL_CLASSES}>
            <span className={THIRD_PLACE_NUMBER_CLASSES}>3</span>
          </div>
        </div>
      ) : null}
    </ArcadeCardGrid>
  );
}
