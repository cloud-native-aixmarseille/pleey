import { AnimationStage } from "../constants";
import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("LeaderboardTitle", {
  slot1: "text-center mb-16 animate-scale-in",
  slot2: "inline-block relative",
  slot3: "font-display text-7xl sm:text-8xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-accent-500 via-primary-500 to-secondary-500 mb-6 animate-glow uppercase tracking-wider",
  slot4: "absolute -inset-8 bg-gradient-to-r from-accent-500/30 via-primary-500/30 to-secondary-500/30 blur-3xl -z-10 animate-pulse-slow",
  slot5: "text-8xl sm:text-9xl mb-6 animate-bounce-slow",
  slot6: "font-display text-4xl sm:text-5xl md:text-6xl text-accent-500 mb-4 uppercase animate-glow",
  slot7: "text-light-300 text-xl sm:text-2xl md:text-3xl font-body",
});


interface LeaderboardTitleProps {
  animationStage: AnimationStage;
}

export function LeaderboardTitle({ animationStage }: LeaderboardTitleProps) {
  if (animationStage < 1) {
    return null;
  }

  return (
    <div {...styles.slot1}>
      <div {...styles.slot2}>
        <h1 {...styles.slot3}>
          GAME OVER
        </h1>
        <div {...styles.slot4} />
      </div>
      <div {...styles.slot5}>🏆</div>
      <h2 {...styles.slot6}>
        Final Leaderboard
      </h2>
      <p {...styles.slot7}>
        Congratulations to all players! 🎉
      </p>
    </div>
  );
}
