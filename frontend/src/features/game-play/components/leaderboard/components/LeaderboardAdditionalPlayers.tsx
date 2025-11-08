import { Card } from "../../../../../shared/components";
import { LeaderboardEntry } from "../../../../../shared/types";
import { ADDITIONAL_PLAYERS_STAGE } from "../constants";

interface LeaderboardAdditionalPlayersProps {
  entries: LeaderboardEntry[];
  animationStage: number;
  startRank?: number;
}

export function LeaderboardAdditionalPlayers({
  entries,
  animationStage,
  startRank = 4,
}: LeaderboardAdditionalPlayersProps) {
  if (entries.length === 0 || animationStage < ADDITIONAL_PLAYERS_STAGE) {
    return null;
  }

  return (
    <section className="max-w-2xl mx-auto mb-8">
      <h3 className="text-2xl font-bold text-white mb-4 text-center font-display uppercase">
        Other Players
      </h3>
      <div className="space-y-3">
        {entries.map((player, index) => (
          <Card
            key={`${player.username}-${index}`}
            className="p-4 sm:p-6 flex justify-between items-center hover:scale-105 transition-transform hover:border-primary-500"
            style={{
              animation: "slideUp 0.4s ease-out",
              animationDelay: `${index * 0.1}s`,
              opacity: 0,
              animationFillMode: "forwards",
            }}
          >
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <span className="text-2xl sm:text-3xl font-black text-light-600 flex-shrink-0 font-display">
                #{startRank + index}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-light-100 truncate font-body">
                {player.username}
              </span>
            </div>
            <div className="glass-effect rounded-xl px-3 sm:px-4 py-2 flex-shrink-0 border border-primary-500/30">
              <span className="text-lg sm:text-xl font-black text-primary-400 font-body">
                {player.totalPoints} pts
              </span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
