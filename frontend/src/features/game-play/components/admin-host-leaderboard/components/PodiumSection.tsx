import { LeaderboardEntry } from "../../../../../shared/types";
import { AnimationStage } from "../constants";
import { createStyles } from "../../../../../shared/ui/styles";

interface PodiumSectionProps {
  leaderboard: LeaderboardEntry[];
  animationStage: AnimationStage;
}

const styles = createStyles("PodiumSection", {
  grid: "grid grid-cols-3 gap-4 sm:gap-6 mb-16 items-end max-w-5xl mx-auto",
  secondContainer:
    "text-center scale-100 transition-all duration-700 transform",
  secondCard:
    "bg-gradient-to-br from-light-100 to-light-300 border-4 border-light-500 p-6 sm:p-8 mb-3 shadow-glow rounded-[1.75rem] hover:scale-105 transition-transform flex flex-col items-center text-center",
  secondMedal: "text-6xl sm:text-7xl md:text-8xl mb-3 animate-bounce-slow",
  secondName:
    "text-2xl sm:text-3xl md:text-4xl font-black text-dark-800 truncate font-display uppercase",
  secondPoints:
    "text-xl sm:text-2xl md:text-3xl font-bold text-dark-600 mt-2 font-body",
  secondPedestal:
    "bg-gradient-to-b from-light-400 to-light-500 h-56 rounded-2xl flex items-center justify-center shadow-glow transform hover:scale-105 transition-transform",
  secondNumber:
    "text-6xl sm:text-7xl md:text-8xl font-black text-white drop-shadow-lg font-display",
  firstContainer: "text-center scale-110 transition-all duration-700 transform",
  firstCard:
    "relative overflow-hidden bg-gradient-to-br from-accent-300 to-accent-500 border-4 border-accent-600 p-8 sm:p-10 mb-3 shadow-neon-accent rounded-[1.75rem] hover:scale-110 transition-all flex flex-col items-center text-center",
  firstOverlay:
    "absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-float",
  firstContent: "relative z-10",
  firstCrown: "text-8xl sm:text-9xl md:text-[10rem] mb-3 animate-bounce-slow",
  firstName:
    "text-3xl sm:text-4xl md:text-5xl font-black text-dark-900 truncate font-display uppercase animate-glow",
  firstPoints:
    "text-2xl sm:text-3xl md:text-4xl font-bold text-dark-800 mt-3 font-body",
  firstPedestal:
    "bg-gradient-to-b from-accent-500 to-accent-600 h-72 rounded-2xl flex items-center justify-center shadow-neon-accent transform hover:scale-105 transition-transform relative overflow-hidden",
  pedestalGlowOverlay: "absolute inset-0 animate-pulse-slow bg-white/10",
  firstNumber:
    "text-8xl sm:text-9xl md:text-[10rem] font-display font-black text-white drop-shadow-lg relative z-10",
  thirdContainer: "text-center scale-95 transition-all duration-700 transform",
  thirdCard:
    "bg-gradient-to-br from-secondary-200 to-secondary-400 border-4 border-secondary-500 p-6 sm:p-8 mb-3 shadow-neon-secondary rounded-[1.75rem] hover:scale-105 transition-transform flex flex-col items-center text-center",
  thirdMedal: "text-6xl sm:text-7xl md:text-8xl mb-3 animate-bounce-slow",
  thirdName:
    "text-2xl sm:text-3xl md:text-4xl font-black text-dark-800 truncate font-display uppercase",
  thirdPoints:
    "text-xl sm:text-2xl md:text-3xl font-bold text-dark-600 mt-2 font-body",
  thirdPedestal:
    "bg-gradient-to-b from-secondary-400 to-secondary-500 h-40 rounded-2xl flex items-center justify-center shadow-neon-secondary transform hover:scale-105 transition-transform",
  thirdNumber:
    "text-6xl sm:text-7xl md:text-8xl font-black text-white drop-shadow-lg font-display",
});

export function PodiumSection({
  leaderboard,
  animationStage,
}: PodiumSectionProps) {
  const secondPlace = leaderboard[1];
  const firstPlace = leaderboard[0];
  const thirdPlace = leaderboard[2];

  return (
    <div {...styles.grid}>
      {secondPlace && animationStage >= 3 && (
        <div
          {...styles.secondContainer}
          style={{ animation: "slideUp 0.7s ease-out, scaleIn 0.5s ease-out" }}
        >
          <div {...styles.secondCard}>
            <div {...styles.secondMedal} style={{ animationDelay: "0.3s" }}>
              🥈
            </div>
            <div {...styles.secondName}>{secondPlace.username}</div>
            <div {...styles.secondPoints}>{secondPlace.totalPoints} pts</div>
          </div>
          <div {...styles.secondPedestal}>
            <span {...styles.secondNumber}>2</span>
          </div>
        </div>
      )}

      {firstPlace && animationStage >= 2 && (
        <div
          {...styles.firstContainer}
          style={{
            animation:
              "slideUp 0.7s ease-out, scaleIn 0.5s ease-out, float 3s ease-in-out infinite 0.7s",
          }}
        >
          <div {...styles.firstCard}>
            <div {...styles.firstOverlay} style={{ animationDuration: "2s" }} />
            <div {...styles.firstContent}>
              <div {...styles.firstCrown}>👑</div>
              <div {...styles.firstName}>{firstPlace.username}</div>
              <div {...styles.firstPoints}>🎯 {firstPlace.totalPoints} pts</div>
            </div>
          </div>
          <div {...styles.firstPedestal}>
            <div {...styles.pedestalGlowOverlay} />
            <span {...styles.firstNumber}>1</span>
          </div>
        </div>
      )}

      {thirdPlace && animationStage >= 4 && (
        <div
          {...styles.thirdContainer}
          style={{ animation: "slideUp 0.7s ease-out, scaleIn 0.5s ease-out" }}
        >
          <div {...styles.thirdCard}>
            <div {...styles.thirdMedal} style={{ animationDelay: "0.6s" }}>
              🥉
            </div>
            <div {...styles.thirdName}>{thirdPlace.username}</div>
            <div {...styles.thirdPoints}>{thirdPlace.totalPoints} pts</div>
          </div>
          <div {...styles.thirdPedestal}>
            <span {...styles.thirdNumber}>3</span>
          </div>
        </div>
      )}
    </div>
  );
}
