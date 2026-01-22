import { useTranslation } from "react-i18next";

import {
  ArcadeBadge,
  ArcadeCardGrid,
  Card,
} from "../../../../../../presentation/shared/ui/components";
import type { Player } from "../../../../../../domains/game/types";
import { resolveAvatarUri } from "../../../../../../presentation/shared/utils/resolveAvatarUri";

interface PlayersGridProps {
  readonly players: readonly Player[];
  readonly fillerSlots: readonly unknown[];
}

export default function PlayersGrid({
  players,
  fillerSlots,
}: PlayersGridProps) {
  const { t } = useTranslation();

  return (
    <ArcadeCardGrid
      layout="quad"
      bottomSpacing="none"
      role="list"
      aria-label={t("game.connectedPlayers")}
    >
      {players.map((player, index) => {
        const avatarUri = resolveAvatarUri(player.avatar);
        const playerKey =
          player.id != null
            ? `player-${player.id}`
            : `guest-${player.username}-${index}`;

        return (
          <div
            key={playerKey}
            className="group animate-slide-up aspect-square sm:aspect-auto"
            role="listitem"
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <div className="h-full [&>div]:h-full">
              <Card
                surface="glass"
                variant="primary"
                padding="sm"
                elevation="glow"
                alignment="center"
              >
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center sm:gap-4">
                  <div className="flex justify-center text-3xl sm:text-5xl">
                    {avatarUri ? (
                      <img
                        src={avatarUri}
                        alt={`Avatar for ${player.username}`}
                        className="h-10 w-10 rounded-full border-2 border-primary-500/40 object-cover sm:h-20 sm:w-20"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span role="img" aria-label={t("game.waiting")}>
                        👤
                      </span>
                    )}
                  </div>
                  <div
                    className="w-full truncate font-mono text-[10px] uppercase tracking-[0.15em] text-accent-900 dark:text-accent-200 sm:text-sm sm:tracking-[0.24em]"
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
          </div>
        );
      })}

      {fillerSlots.map((_, index) => (
        <div
          key={`empty-${index}`}
          className="animate-slide-up opacity-40 aspect-square sm:aspect-auto"
          role="listitem"
        >
          <div className="h-full [&>div]:h-full">
            <Card
              surface="glass"
              variant="neutral"
              padding="sm"
              elevation="glow"
              alignment="center"
              aria-hidden="true"
            >
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center sm:gap-4">
                <span aria-hidden="true" className="text-3xl sm:text-5xl">
                  👤
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-dark-400 dark:text-light-500 sm:text-sm sm:tracking-[0.24em]">
                  {t("game.waiting")}
                </span>
              </div>
            </Card>
          </div>
        </div>
      ))}
    </ArcadeCardGrid>
  );
}
