import {
  ArcadeGlassStack,
  ArcadeLeaderboardRow,
} from "../../../../../../presentation/shared/ui/components";
import type { LeaderboardEntry } from "../../../../../../domains/game/types";
import { useTranslation } from "react-i18next";
import { ADDITIONAL_PLAYERS_STAGE } from "../constants";

interface LeaderboardAdditionalPlayersProps {
  entries: LeaderboardEntry[];
  animationStage: number;
  startRank?: number;
  title?: string;
  tone?: "primary" | "accent" | "secondary";
  width?: "md" | "lg";
  spacing?: "md" | "lg";
}

export function LeaderboardAdditionalPlayers({
  entries,
  animationStage,
  startRank = 4,
  title,
  tone = "primary",
  width = "md",
  spacing = "md",
}: LeaderboardAdditionalPlayersProps) {
  const { t } = useTranslation();

  if (entries.length === 0 || animationStage < ADDITIONAL_PLAYERS_STAGE) {
    return null;
  }

  return (
    <ArcadeGlassStack
      title={title ?? t("game.leaderboardPage.additionalPlayers.title")}
      tone={tone}
      align="center"
      width={width}
      spacing={spacing}
    >
      {entries.map((player, index) => (
        <ArcadeLeaderboardRow
          key={player.userId ?? `${player.username}-${index}`}
          position={startRank + index}
          username={player.username}
          points={player.totalPoints}
          tone={tone}
          animationOrder={index}
        />
      ))}
    </ArcadeGlassStack>
  );
}
