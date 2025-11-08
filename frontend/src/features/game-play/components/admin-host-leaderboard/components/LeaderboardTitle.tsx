import { AnimationStage } from "../constants";

interface LeaderboardTitleProps {
  animationStage: AnimationStage;
}

export function LeaderboardTitle({ animationStage }: LeaderboardTitleProps) {
  if (animationStage < 1) {
    return null;
  }

  return (
    <div className="text-center mb-16 animate-scale-in">
      <div className="inline-block relative">
        <h1 className="font-display text-7xl sm:text-8xl md:text-9xl text-transparent bg-clip-text bg-gradient-to-r from-accent-500 via-primary-500 to-secondary-500 mb-6 animate-glow uppercase tracking-wider">
          GAME OVER
        </h1>
        <div className="absolute -inset-8 bg-gradient-to-r from-accent-500/30 via-primary-500/30 to-secondary-500/30 blur-3xl -z-10 animate-pulse-slow" />
      </div>
      <div className="text-8xl sm:text-9xl mb-6 animate-bounce-slow">🏆</div>
      <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-accent-500 mb-4 uppercase animate-glow">
        Final Leaderboard
      </h2>
      <p className="text-light-300 text-xl sm:text-2xl md:text-3xl font-body">
        Congratulations to all players! 🎉
      </p>
    </div>
  );
}
