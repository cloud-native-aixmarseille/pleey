import { LeaderboardEntry } from "../../../../../shared/types";
import { Card } from "../../../../../shared/components";
import { AnimationStage } from "../constants";

interface LeaderboardAdditionalPlayersProps {
  leaderboard: LeaderboardEntry[];
  animationStage: AnimationStage;
}

export function LeaderboardAdditionalPlayers({
  leaderboard,
  animationStage,
}: LeaderboardAdditionalPlayersProps) {
  const remainingPlayers = leaderboard.slice(3);

  if (remainingPlayers.length === 0 || animationStage < 5) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto mb-12">
      <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6 text-center font-display uppercase">
        Other Top Players
      </h3>
      <div className="space-y-4">
        {remainingPlayers.map((player, index) => (
          <Card
            key={player.username + player.totalPoints}
            className="p-6 sm:p-8 flex justify-between items-center hover:scale-105 transition-transform hover:border-primary-500 border-2 border-accent-500/30"
            style={{
              animation: "slideUp 0.4s ease-out",
              animationDelay: `${index * 0.1}s`,
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
              <span className="text-3xl sm:text-4xl md:text-5xl font-black text-light-600 flex-shrink-0 font-display">
                #{index + 4}
              </span>
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-light-100 truncate font-body">
                {player.username}
              </span>
            </div>
            <div className="glass-effect rounded-xl px-4 sm:px-6 py-3 flex-shrink-0 border-2 border-primary-500/50">
              <span className="text-2xl sm:text-3xl md:text-4xl font-black text-primary-400 font-body">
                {player.totalPoints} pts
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
