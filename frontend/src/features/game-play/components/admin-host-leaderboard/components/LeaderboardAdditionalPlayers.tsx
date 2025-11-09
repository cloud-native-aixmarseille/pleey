import { LeaderboardEntry } from "../../../../../shared/types";
import {
  ArcadeGlassStack,
  ArcadeLeaderboardRow,
} from "../../../../../shared/components";
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
    <ArcadeGlassStack
      title="Other Top Players"
      tone="accent"
      align="center"
      width="lg"
      spacing="lg"
    >
      {remainingPlayers.map((player, index) => (
        <ArcadeLeaderboardRow
          key={player.userId ?? `${player.username}-${index}`}
          position={index + 4}
          username={player.username}
          points={player.totalPoints}
          tone="accent"
          animationOrder={index}
        />
      ))}
    </ArcadeGlassStack>
  );
}
