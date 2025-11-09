import { LeaderboardEntry } from "../../../../../shared/types";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("LeaderboardPodium", {
  slot1: "grid grid-cols-3 gap-2 sm:gap-4 mb-12 items-end max-w-3xl mx-auto",
  slot2: "text-5xl sm:text-6xl mb-2 animate-bounce-slow",
  slot3:
    "text-lg sm:text-2xl font-black text-dark-800 truncate font-display uppercase",
  slot4: "text-base sm:text-xl font-bold text-dark-600 mt-1 font-body",
  slot5:
    "text-5xl sm:text-6xl font-black text-white drop-shadow-lg font-display",
  slot6:
    "absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-float",
  slot7: "relative z-10",
  slot8: "text-7xl sm:text-8xl mb-2 animate-bounce-slow",
  slot9:
    "text-2xl sm:text-3xl font-black text-dark-900 truncate font-display uppercase animate-glow",
  slot10: "text-xl sm:text-2xl font-bold text-dark-800 mt-2 font-body",
  slot11: "absolute inset-0 animate-pulse-slow bg-white/10",
  slot12:
    "text-7xl sm:text-8xl font-black text-white drop-shadow-lg font-display relative z-10",
  secondContainer:
    "text-center scale-100 transition-all duration-700 transform",
  secondCardWrapper:
    "bg-gradient-to-br from-light-50 to-light-200 border-4 border-light-400 p-4 sm:p-6 mb-2 shadow-glow rounded-[1.75rem] hover:scale-105 transition-transform flex flex-col items-center text-center",
  secondPedestal:
    "bg-gradient-to-b from-light-300 to-light-400 h-44 rounded-2xl flex items-center justify-center shadow-glow transform hover:scale-105 transition-transform",
  firstContainer: "text-center scale-110 transition-all duration-700 transform",
  firstCardWrapper:
    "relative overflow-hidden bg-gradient-to-br from-accent-200 to-accent-400 border-4 border-accent-500 p-6 sm:p-8 mb-2 shadow-neon-accent rounded-[1.75rem] hover:scale-110 transition-all flex flex-col items-center text-center",
  firstPedestal:
    "bg-gradient-to-b from-accent-400 to-accent-500 h-56 rounded-2xl flex items-center justify-center shadow-neon-accent transform hover:scale-105 transition-transform relative overflow-hidden",
  thirdContainer: "text-center scale-95 transition-all duration-700 transform",
  thirdCardWrapper:
    "bg-gradient-to-br from-secondary-100 to-secondary-300 border-4 border-secondary-400 p-4 sm:p-6 mb-2 shadow-neon-secondary rounded-[1.75rem] hover:scale-105 transition-transform flex flex-col items-center text-center",
  thirdPedestal:
    "bg-gradient-to-b from-secondary-300 to-secondary-400 h-32 rounded-2xl flex items-center justify-center shadow-neon-secondary transform hover:scale-105 transition-transform",
});

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
    <section {...styles.slot1}>
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
      {...styles.secondContainer}
      style={{ animation: "slideUp 0.7s ease-out, scaleIn 0.5s ease-out" }}
    >
      <div {...styles.secondCardWrapper}>
        <div {...styles.slot2} style={{ animationDelay: "0.3s" }}>
          🥈
        </div>
        <div {...styles.slot3}>{entry.username}</div>
        <div {...styles.slot4}>{entry.totalPoints} pts</div>
      </div>
      <div {...styles.secondPedestal}>
        <span {...styles.slot5}>2</span>
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
      {...styles.firstContainer}
      style={{
        animation:
          "slideUp 0.7s ease-out, scaleIn 0.5s ease-out, float 3s ease-in-out infinite 0.7s",
      }}
    >
      <div {...styles.firstCardWrapper}>
        <div {...styles.slot6} style={{ animationDuration: "2s" }} />
        <div {...styles.slot7}>
          <div {...styles.slot8}>👑</div>
          <div {...styles.slot9}>{entry.username}</div>
          <div {...styles.slot10}>🎯 {entry.totalPoints} pts</div>
        </div>
      </div>
      <div {...styles.firstPedestal}>
        <div {...styles.slot11} />
        <span {...styles.slot12}>1</span>
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
      {...styles.thirdContainer}
      style={{ animation: "slideUp 0.7s ease-out, scaleIn 0.5s ease-out" }}
    >
      <div {...styles.thirdCardWrapper}>
        <div {...styles.slot2} style={{ animationDelay: "0.6s" }}>
          🥉
        </div>
        <div {...styles.slot3}>{entry.username}</div>
        <div {...styles.slot4}>{entry.totalPoints} pts</div>
      </div>
      <div {...styles.thirdPedestal}>
        <span {...styles.slot5}>3</span>
      </div>
    </div>
  );
}
