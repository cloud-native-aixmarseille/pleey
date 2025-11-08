interface LeaderboardHeaderProps {
  isVisible: boolean;
}

export function LeaderboardHeader({ isVisible }: LeaderboardHeaderProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <header className="text-center mb-12 animate-scale-in">
      <div className="inline-block relative">
        <h1 className="font-display text-6xl sm:text-7xl md:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-accent-500 via-primary-500 to-secondary-500 mb-4 animate-glow uppercase tracking-wider">
          GAME OVER
        </h1>
        <div className="absolute -inset-4 bg-gradient-to-r from-accent-500/20 via-primary-500/20 to-secondary-500/20 blur-2xl -z-10 animate-pulse-slow" />
      </div>
      <div className="text-7xl sm:text-8xl mb-4 animate-bounce-slow">🏆</div>
      <h2 className="font-display text-3xl sm:text-4xl text-accent-500 mb-2 uppercase animate-glow">
        Final Results
      </h2>
      <p className="text-light-300 text-lg sm:text-xl font-body">
        Congratulations to all players! 🎉
      </p>
    </header>
  );
}
