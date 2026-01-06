import {
  ArcadeGlassStack,
  ArcadeLeaderboardRow,
} from "../../../../../../presentation/shared/ui/components";
import type { LeaderboardEntry } from "../../../../../../domains/game/types";
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
    <ArcadeGlassStack
      title="Other Players"
      tone="primary"
      align="center"
      width="md"
      spacing="md"
    >
      {entries.map((player, index) => (
        <ArcadeLeaderboardRow
          key={player.userId ?? `${player.username}-${index}`}
          position={startRank + index}
          username={player.username}
          points={player.totalPoints}
          tone="primary"
          animationOrder={index}
        />
      ))}
    </ArcadeGlassStack>
  );
}
