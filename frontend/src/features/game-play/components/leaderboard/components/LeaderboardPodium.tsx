import { LeaderboardEntry } from "../../../../../shared/types";

const PODIUM_LAYOUT_CLASSES =
  "mx-auto mb-12 grid max-w-3xl grid-cols-3 items-end gap-2 sm:gap-4";

const MEDAL_EMOJI_CLASSES = "mb-2 text-5xl animate-bounce-slow sm:text-6xl";
const PLAYER_NAME_CLASSES =
  "truncate font-display text-lg font-black uppercase text-dark-800 sm:text-2xl";
const PLAYER_SCORE_CLASSES =
  "mt-1 font-body text-base font-bold text-dark-600 sm:text-xl";
const PEDESTAL_NUMBER_CLASSES =
  "font-display text-5xl font-black text-white drop-shadow-lg sm:text-6xl";

const SECOND_CONTAINER_CLASSES =
  "transform text-center transition-all duration-700 scale-100";
const SECOND_CARD_CLASSES =
  "shadow-glow mb-2 flex flex-col items-center text-center rounded-[1.75rem] border-4 border-light-400 bg-gradient-to-br from-light-50 to-light-200 p-4 transition-transform hover:scale-105 sm:p-6";
const SECOND_PEDESTAL_CLASSES =
  "shadow-glow flex h-44 items-center justify-center rounded-2xl bg-gradient-to-b from-light-300 to-light-400 transition-transform hover:scale-105";

const FIRST_CONTAINER_CLASSES =
  "transform text-center transition-all duration-700 scale-110";
const FIRST_CARD_CLASSES =
  "relative mb-2 flex flex-col items-center text-center rounded-[1.75rem] border-4 border-accent-500 bg-gradient-to-br from-accent-200 to-accent-400 p-6 transition-all hover:scale-110 shadow-neon-accent sm:p-8 overflow-hidden";
const FIRST_CARD_GLOW_CLASSES =
  "absolute inset-0 animate-float bg-gradient-to-r from-transparent via-white/30 to-transparent";
const FIRST_CARD_CONTENT_CLASSES = "relative z-10";
const FIRST_MEDAL_CLASSES = "mb-2 text-7xl animate-bounce-slow sm:text-8xl";
const FIRST_PLAYER_NAME_CLASSES =
  "truncate font-display text-2xl font-black uppercase text-dark-900 animate-glow sm:text-3xl";
const FIRST_PLAYER_SCORE_CLASSES =
  "mt-2 font-body text-xl font-bold text-dark-800 sm:text-2xl";
const FIRST_PEDESTAL_CLASSES =
  "relative flex h-56 items-center justify-center rounded-2xl bg-gradient-to-b from-accent-400 to-accent-500 transition-transform hover:scale-105 shadow-neon-accent overflow-hidden";
const FIRST_PEDESTAL_OVERLAY_CLASSES =
  "absolute inset-0 bg-white/10 animate-pulse-slow";
const FIRST_PEDESTAL_NUMBER_CLASSES =
  "relative z-10 font-display text-7xl font-black text-white drop-shadow-lg sm:text-8xl";

const THIRD_CONTAINER_CLASSES =
  "transform text-center transition-all duration-700 scale-95";
const THIRD_CARD_CLASSES =
  "shadow-neon-secondary mb-2 flex flex-col items-center text-center rounded-[1.75rem] border-4 border-secondary-400 bg-gradient-to-br from-secondary-100 to-secondary-300 p-4 transition-transform hover:scale-105 sm:p-6";
const THIRD_PEDESTAL_CLASSES =
  "shadow-neon-secondary flex h-32 items-center justify-center rounded-2xl bg-gradient-to-b from-secondary-300 to-secondary-400 transition-transform hover:scale-105";

interface LeaderboardPodiumProps {
  entries: LeaderboardEntry[];
  animationStage: number;
}

export function LeaderboardPodium({
  entries,
  animationStage,
}: LeaderboardPodiumProps) {
  const firstPlace = entries[0];
  const secondPlace = entries[1];
  const thirdPlace = entries[2];

  return (
    <section className={PODIUM_LAYOUT_CLASSES}>
      {renderSecondPlace(secondPlace, animationStage)}
      {renderFirstPlace(firstPlace, animationStage)}
      {renderThirdPlace(thirdPlace, animationStage)}
    </section>
  );
}

function renderSecondPlace(
  entry: LeaderboardEntry | undefined,
  animationStage: number
) {
  if (!entry || animationStage < 3) {
    return null;
  }

  return (
    <div
      className={SECOND_CONTAINER_CLASSES}
      style={{ animation: "slideUp 0.7s ease-out, scaleIn 0.5s ease-out" }}
    >
      <div className={SECOND_CARD_CLASSES}>
        <div className={MEDAL_EMOJI_CLASSES} style={{ animationDelay: "0.3s" }}>
          🥈
        </div>
        <div className={PLAYER_NAME_CLASSES}>{entry.username}</div>
        <div className={PLAYER_SCORE_CLASSES}>{entry.totalPoints} pts</div>
      </div>
      <div className={SECOND_PEDESTAL_CLASSES}>
        <span className={PEDESTAL_NUMBER_CLASSES}>2</span>
      </div>
    </div>
  );
}

function renderFirstPlace(
  entry: LeaderboardEntry | undefined,
  animationStage: number
) {
  if (!entry || animationStage < 2) {
    return null;
  }

  return (
    <div
      className={FIRST_CONTAINER_CLASSES}
      style={{
        animation:
          "slideUp 0.7s ease-out, scaleIn 0.5s ease-out, float 3s ease-in-out infinite 0.7s",
      }}
    >
      <div className={FIRST_CARD_CLASSES}>
        <div
          className={FIRST_CARD_GLOW_CLASSES}
          style={{ animationDuration: "2s" }}
        />
        <div className={FIRST_CARD_CONTENT_CLASSES}>
          <div className={FIRST_MEDAL_CLASSES}>👑</div>
          <div className={FIRST_PLAYER_NAME_CLASSES}>{entry.username}</div>
          <div className={FIRST_PLAYER_SCORE_CLASSES}>
            🎯 {entry.totalPoints} pts
          </div>
        </div>
      </div>
      <div className={FIRST_PEDESTAL_CLASSES}>
        <div className={FIRST_PEDESTAL_OVERLAY_CLASSES} />
        <span className={FIRST_PEDESTAL_NUMBER_CLASSES}>1</span>
      </div>
    </div>
  );
}

function renderThirdPlace(
  entry: LeaderboardEntry | undefined,
  animationStage: number
) {
  if (!entry || animationStage < 4) {
    return null;
  }

  return (
    <div
      className={THIRD_CONTAINER_CLASSES}
      style={{ animation: "slideUp 0.7s ease-out, scaleIn 0.5s ease-out" }}
    >
      <div className={THIRD_CARD_CLASSES}>
        <div className={MEDAL_EMOJI_CLASSES} style={{ animationDelay: "0.6s" }}>
          🥉
        </div>
        <div className={PLAYER_NAME_CLASSES}>{entry.username}</div>
        <div className={PLAYER_SCORE_CLASSES}>{entry.totalPoints} pts</div>
      </div>
      <div className={THIRD_PEDESTAL_CLASSES}>
        <span className={PEDESTAL_NUMBER_CLASSES}>3</span>
      </div>
    </div>
  );
}
