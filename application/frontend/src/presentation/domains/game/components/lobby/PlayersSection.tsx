import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  ArcadeBadge,
  ArcadeCardGrid,
  ArcadeGlassStack,
  Card,
} from "../../../../../presentation/shared/ui/components";
import type { Player } from "../../../../../domains/game/types";
import { resolveAvatarUrl } from "../../../../../presentation/shared/utils/resolveAvatarUrl";

interface PlayersSectionProps {
  readonly players: readonly Player[];
  readonly sectionTitleId: string;
}

function PlayersSectionComponent({
  players,
  sectionTitleId,
}: PlayersSectionProps) {
  const { t } = useTranslation();
  const playerCount = players.length;

  const fillerSlots = useMemo(() => {
    if (playerCount >= 8) {
      return [];
    }

    return Array.from({ length: Math.min(3, 8 - playerCount) });
  }, [playerCount]);

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
        <ArcadeCardGrid
          layout="quad"
          bottomSpacing="none"
          role="list"
          aria-label={t("game.connectedPlayers")}
        >
          {players.map((player, index) => {
            const avatarUrl = resolveAvatarUrl(player.avatar);
            const playerKey =
              player.id != null
                ? `player-${player.id}`
                : `guest-${player.username}-${index}`;

            return (
              <div
                key={playerKey}
                className="group animate-slide-up"
                role="listitem"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <Card
                  surface="glass"
                  variant="primary"
                  padding="sm"
                  elevation="glow"
                  alignment="center"
                >
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex justify-center text-4xl sm:text-5xl">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={`Avatar for ${player.username}`}
                          className="h-16 w-16 rounded-full border-2 border-primary-500/40 object-cover sm:h-20 sm:w-20"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span role="img" aria-label={t("game.waiting")}>
                          👤
                        </span>
                      )}
                    </div>
                    <div
                      className="w-full truncate font-mono text-xs uppercase tracking-[0.24em] text-accent-900 dark:text-accent-200 sm:text-sm"
                      title={player.username}
                    >
                      {player.username}
                    </div>
                    <ArcadeBadge variant="success" size="xs" indicator pulse>
                      {t("game.ready")}
                    </ArcadeBadge>
                  </div>
                </Card>
              </div>
            );
          })}

          {fillerSlots.map((_, index) => (
            <div
              key={`empty-${index}`}
              className="animate-slide-up opacity-40"
              role="listitem"
            >
              <Card
                surface="glass"
                variant="neutral"
                padding="sm"
                elevation="glow"
                alignment="center"
                aria-hidden="true"
              >
                <div className="flex flex-col items-center gap-4 text-center">
                  <span aria-hidden="true" className="text-4xl sm:text-5xl">
                    👤
                  </span>
                  <span className="font-mono text-xs uppercase tracking-[0.24em] text-dark-400 dark:text-light-500 sm:text-sm">
                    {t("game.waiting")}
                  </span>
                </div>
              </Card>
            </div>
          ))}
        </ArcadeCardGrid>
      ) : (
        <div
          className="flex flex-col items-center gap-4 py-12 text-center"
          role="status"
          aria-live="polite"
        >
          <span
            aria-hidden="true"
            className="text-6xl opacity-30 animate-pulse-slow sm:text-7xl"
          >
            👥
          </span>
          <p className="font-display text-lg uppercase tracking-[0.3em] text-primary-900 dark:text-primary-200 sm:text-xl">
            {t("game.noPlayersYetTitle")}
          </p>
          <p className="text-sm text-dark-500 dark:text-light-500 sm:text-base">
            {t("game.sharePin")}
          </p>
        </div>
      )}
    </ArcadeGlassStack>
  );
}

const PlayersSection = memo(PlayersSectionComponent);

export default PlayersSection;
