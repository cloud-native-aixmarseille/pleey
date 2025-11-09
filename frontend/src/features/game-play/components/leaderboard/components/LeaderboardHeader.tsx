import { createStyles } from "../../../../../shared/ui/styles";

const styles = createStyles("LeaderboardHeader", {
  slot1: "text-center mb-12 animate-scale-in",
  slot2: "inline-block relative",
  slot3: "font-display text-6xl sm:text-7xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-accent-500 via-primary-500 to-secondary-500 mb-4 animate-glow uppercase tracking-wider",
  slot4: "absolute -inset-4 bg-gradient-to-r from-accent-500/20 via-primary-500/20 to-secondary-500/20 blur-2xl -z-10 animate-pulse-slow",
  slot5: "text-7xl sm:text-8xl mb-4 animate-bounce-slow",
  slot6: "font-display text-3xl sm:text-4xl text-accent-500 mb-2 uppercase animate-glow",
  slot7: "text-light-300 text-lg sm:text-xl font-body",
});

interface LeaderboardHeaderProps {
  isVisible: boolean;
}

export function LeaderboardHeader({ isVisible }: LeaderboardHeaderProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <header {...styles.slot1}>
      <div {...styles.slot2}>
        <h1 {...styles.slot3}>
          GAME OVER
        </h1>
        <div {...styles.slot4} />
      </div>
      <div {...styles.slot5}>🏆</div>
      <h2 {...styles.slot6}>
        Final Results
      </h2>
      <p {...styles.slot7}>
        Congratulations to all players! 🎉
      </p>
    </header>
  );
}
