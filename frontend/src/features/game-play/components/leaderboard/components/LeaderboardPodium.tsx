import { Card } from "../../../../../shared/components";
import { LeaderboardEntry } from "../../../../../shared/types";
import { PODIUM_CONFIG } from "../constants";

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
    <section className="grid grid-cols-3 gap-2 sm:gap-4 mb-12 items-end max-w-3xl mx-auto">
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

  const config = PODIUM_CONFIG[2];

  return (
    <div
      className={`text-center ${config.pedestalScale} transition-all duration-700 transform`}
      style={{ animation: "slideUp 0.7s ease-out, scaleIn 0.5s ease-out" }}
    >
      <Card
        className={`bg-gradient-to-br from-light-50 to-light-200 border-4 border-light-400 p-4 sm:p-6 mb-2 ${config.pedestalGlow} hover:scale-105 transition-transform`}
      >
        <div
          className="text-5xl sm:text-6xl mb-2 animate-bounce-slow"
          style={{ animationDelay: "0.3s" }}
        >
          🥈
        </div>
        <div className="text-lg sm:text-2xl font-black text-dark-800 truncate font-display uppercase">
          {entry.username}
        </div>
        <div className="text-base sm:text-xl font-bold text-dark-600 mt-1 font-body">
          {entry.totalPoints} pts
        </div>
      </Card>
      <div
        className={`bg-gradient-to-b ${config.pedestalGradient} ${config.pedestalHeight} rounded-2xl flex items-center justify-center ${config.pedestalGlow} transform hover:scale-105 transition-transform`}
      >
        <span className="text-5xl sm:text-6xl font-black text-white drop-shadow-lg font-display">
          2
        </span>
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

  const config = PODIUM_CONFIG[1];

  return (
    <div
      className={`text-center ${config.pedestalScale} transition-all duration-700 transform`}
      style={{
        animation:
          "slideUp 0.7s ease-out, scaleIn 0.5s ease-out, float 3s ease-in-out infinite 0.7s",
      }}
    >
      <Card
        className={`bg-gradient-to-br from-accent-200 to-accent-400 border-4 border-accent-500 p-6 sm:p-8 mb-2 ${config.pedestalGlow} hover:scale-110 transition-all relative overflow-hidden`}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-float"
          style={{ animationDuration: "2s" }}
        />
        <div className="relative z-10">
          <div className="text-7xl sm:text-8xl mb-2 animate-bounce-slow">
            👑
          </div>
          <div className="text-2xl sm:text-3xl font-black text-dark-900 truncate font-display uppercase animate-glow">
            {entry.username}
          </div>
          <div className="text-xl sm:text-2xl font-bold text-dark-800 mt-2 font-body">
            🎯 {entry.totalPoints} pts
          </div>
        </div>
      </Card>
      <div
        className={`bg-gradient-to-b ${config.pedestalGradient} ${config.pedestalHeight} rounded-2xl flex items-center justify-center ${config.pedestalGlow} transform hover:scale-105 transition-transform relative overflow-hidden`}
      >
        <div className="absolute inset-0 animate-pulse-slow bg-white/10" />
        <span className="text-7xl sm:text-8xl font-black text-white drop-shadow-lg font-display relative z-10">
          1
        </span>
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

  const config = PODIUM_CONFIG[3];

  return (
    <div
      className={`text-center ${config.pedestalScale} transition-all duration-700 transform`}
      style={{ animation: "slideUp 0.7s ease-out, scaleIn 0.5s ease-out" }}
    >
      <Card
        className={`bg-gradient-to-br from-secondary-100 to-secondary-300 border-4 border-secondary-400 p-4 sm:p-6 mb-2 ${config.pedestalGlow} hover:scale-105 transition-transform`}
      >
        <div
          className="text-5xl sm:text-6xl mb-2 animate-bounce-slow"
          style={{ animationDelay: "0.6s" }}
        >
          🥉
        </div>
        <div className="text-lg sm:text-2xl font-black text-dark-800 truncate font-display uppercase">
          {entry.username}
        </div>
        <div className="text-base sm:text-xl font-bold text-dark-600 mt-1 font-body">
          {entry.totalPoints} pts
        </div>
      </Card>
      <div
        className={`bg-gradient-to-b ${config.pedestalGradient} ${config.pedestalHeight} rounded-2xl flex items-center justify-center ${config.pedestalGlow} transform hover:scale-105 transition-transform`}
      >
        <span className="text-5xl sm:text-6xl font-black text-white drop-shadow-lg font-display">
          3
        </span>
      </div>
    </div>
  );
}
