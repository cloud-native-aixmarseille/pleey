import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ArcadeBadge,
  ArcadeGlassStack,
} from "../../../../../presentation/shared/ui/components";
import type { Player } from "../../../../../domains/game/types";

import CurrentPlayerCard from "./players/CurrentPlayerCard";
import PlayersEmptyState from "./players/PlayersEmptyState";
import PlayersGrid from "./players/PlayersGrid";
import { selectHighlightedPlayers } from "./players/selectHighlightedPlayers";

interface PlayersSectionProps {
  readonly players: readonly Player[];
  readonly sectionTitleId: string;
  readonly highlightPlayerId?: number | string | null;
  readonly highlightPlayerUsername?: string | null;
}

function PlayersSectionComponent({
  players,
  sectionTitleId,
  highlightPlayerId = null,
  highlightPlayerUsername = null,
}: PlayersSectionProps) {
  const { t } = useTranslation();
  const playerCount = players.length;

  const fillerSlots = useMemo(() => {
    if (playerCount >= 8) {
      return [];
    }

    return Array.from({ length: Math.min(3, 8 - playerCount) });
  }, [playerCount]);

  const { currentPlayer, otherPlayers } = useMemo(
    () =>
      selectHighlightedPlayers(
        players,
        highlightPlayerId,
        highlightPlayerUsername
      ),
    [players, highlightPlayerId, highlightPlayerUsername]
  );

  return (
    <ArcadeGlassStack
      title={t("game.connectedPlayers")}
      tone="primary"
      align="center"
      width="lg"
      spacing="md"
      titleId={sectionTitleId}
    >
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <span
          aria-hidden="true"
          className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent sm:block"
        />
        <ArcadeBadge variant="accent" size="sm" indicator pulse>
          {playerCount}
        </ArcadeBadge>
        <span
          aria-hidden="true"
          className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent sm:block"
        />
      </div>

      {playerCount > 0 ? (
        <div className="w-full space-y-4">
          {currentPlayer ? <CurrentPlayerCard player={currentPlayer} /> : null}

          <PlayersGrid players={otherPlayers} fillerSlots={fillerSlots} />
        </div>
      ) : (
        <PlayersEmptyState />
      )}
    </ArcadeGlassStack>
  );
}

const PlayersSection = memo(PlayersSectionComponent);

export default PlayersSection;
