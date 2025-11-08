import { LeaderboardEntry } from "../../../../../shared/types";
import { Card } from "../../../../../shared/components";
import { AnimationStage } from "../constants";

interface PodiumSectionProps {
  leaderboard: LeaderboardEntry[];
  animationStage: AnimationStage;
}

const podiumColors = {
  1: {
    bg: "from-accent-500 to-accent-600",
    height: "h-72",
    scale: "scale-110",
    glow: "shadow-neon-accent",
  },
  2: {
    bg: "from-light-400 to-light-500",
    height: "h-56",
    scale: "scale-100",
    glow: "shadow-glow",
  },
  3: {
    bg: "from-secondary-400 to-secondary-500",
    height: "h-40",
    scale: "scale-95",
    glow: "shadow-neon-secondary",
  },
} as const;

export function PodiumSection({
  leaderboard,
  animationStage,
}: PodiumSectionProps) {
  const secondPlace = leaderboard[1];
  const firstPlace = leaderboard[0];
  const thirdPlace = leaderboard[2];

  return (
    <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-16 items-end max-w-5xl mx-auto">
      {secondPlace && animationStage >= 3 && (
        <div
          className={`text-center ${podiumColors[2].scale} transition-all duration-700 transform`}
          style={{ animation: "slideUp 0.7s ease-out, scaleIn 0.5s ease-out" }}
        >
          <Card
            className={`bg-gradient-to-br from-light-100 to-light-300 border-4 border-light-500 p-6 sm:p-8 mb-3 ${podiumColors[2].glow} hover:scale-105 transition-transform`}
          >
            <div
              className="text-6xl sm:text-7xl md:text-8xl mb-3 animate-bounce-slow"
              style={{ animationDelay: "0.3s" }}
            >
              🥈
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-dark-800 truncate font-display uppercase">
              {secondPlace.username}
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-dark-600 mt-2 font-body">
              {secondPlace.totalPoints} pts
            </div>
          </Card>
          <div
            className={`bg-gradient-to-b ${podiumColors[2].bg} ${podiumColors[2].height} rounded-2xl flex items-center justify-center shadow-glow transform hover:scale-105 transition-transform`}
          >
            <span className="text-6xl sm:text-7xl md:text-8xl font-black text-white drop-shadow-lg font-display">
              2
            </span>
          </div>
        </div>
      )}

      {firstPlace && animationStage >= 2 && (
        <div
          className={`text-center ${podiumColors[1].scale} transition-all duration-700 transform`}
          style={{
            animation:
              "slideUp 0.7s ease-out, scaleIn 0.5s ease-out, float 3s ease-in-out infinite 0.7s",
          }}
        >
          <Card className="bg-gradient-to-br from-accent-300 to-accent-500 border-4 border-accent-600 p-8 sm:p-10 mb-3 shadow-neon-accent hover:scale-110 transition-all relative overflow-hidden">
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-float"
              style={{ animationDuration: "2s" }}
            />
            <div className="relative z-10">
              <div className="text-8xl sm:text-9xl md:text-[10rem] mb-3 animate-bounce-slow">
                👑
              </div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 truncate font-display uppercase animate-glow">
                {firstPlace.username}
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark-800 mt-3 font-body">
                🎯 {firstPlace.totalPoints} pts
              </div>
            </div>
          </Card>
          <div
            className={`bg-gradient-to-b ${podiumColors[1].bg} ${podiumColors[1].height} rounded-2xl flex items-center justify-center shadow-neon-accent transform hover:scale-105 transition-transform relative overflow-hidden`}
          >
            <div className="absolute inset-0 animate-pulse-slow bg-white/10" />
            <span className="text-8xl sm:text-9xl md:text-[10rem] font-black text-white drop-shadow-lg font-display relative z-10">
              1
            </span>
          </div>
        </div>
      )}

      {thirdPlace && animationStage >= 4 && (
        <div
          className={`text-center ${podiumColors[3].scale} transition-all duration-700 transform`}
          style={{ animation: "slideUp 0.7s ease-out, scaleIn 0.5s ease-out" }}
        >
          <Card
            className={`bg-gradient-to-br from-secondary-200 to-secondary-400 border-4 border-secondary-500 p-6 sm:p-8 mb-3 ${podiumColors[3].glow} hover:scale-105 transition-transform`}
          >
            <div
              className="text-6xl sm:text-7xl md:text-8xl mb-3 animate-bounce-slow"
              style={{ animationDelay: "0.6s" }}
            >
              🥉
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl font-black text-dark-800 truncate font-display uppercase">
              {thirdPlace.username}
            </div>
            <div className="text-xl sm:text-2xl md:text-3xl font-bold text-dark-600 mt-2 font-body">
              {thirdPlace.totalPoints} pts
            </div>
          </Card>
          <div
            className={`bg-gradient-to-b ${podiumColors[3].bg} ${podiumColors[3].height} rounded-2xl flex items-center justify-center shadow-neon-secondary transform hover:scale-105 transition-transform`}
          >
            <span className="text-6xl sm:text-7xl md:text-8xl font-black text-white drop-shadow-lg font-display">
              3
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
