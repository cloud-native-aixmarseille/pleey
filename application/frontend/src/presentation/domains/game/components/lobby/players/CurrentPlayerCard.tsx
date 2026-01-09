import { useTranslation } from "react-i18next";

import {
  ArcadeBadge,
  Card,
} from "../../../../../../presentation/shared/ui/components";
import type { Player } from "../../../../../../domains/game/types";
import { resolveAvatarUrl } from "../../../../../../presentation/shared/utils/resolveAvatarUrl";

interface CurrentPlayerCardProps {
  readonly player: Player;
}

export default function CurrentPlayerCard({ player }: CurrentPlayerCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className="rounded-[var(--arcade-radius-lg)] ring-2 ring-accent-400/70"
      data-current-player="true"
      aria-current="true"
    >
      <Card
        surface="glass"
        variant="accent"
        padding="sm"
        elevation="glow"
        alignment="center"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex justify-center text-3xl sm:text-4xl">
              {resolveAvatarUrl(player.avatar) ? (
                <img
                  src={resolveAvatarUrl(player.avatar) as string}
                  alt={`Avatar for ${player.username}`}
                  className="h-14 w-14 rounded-full border-2 border-accent-400/50 object-cover sm:h-16 sm:w-16"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span role="img" aria-label={t("game.waiting")}>
                  👤
                </span>
              )}
            </div>
            <div className="min-w-0">
              <div
                className="truncate font-mono text-xs uppercase tracking-[0.24em] text-accent-900 dark:text-accent-200 sm:text-sm"
                title={player.username}
              >
                {player.username}
              </div>
              <div className="mt-2">
                <ArcadeBadge variant="accent" size="xs" indicator pulse>
                  {t("game.you").toUpperCase()}
                </ArcadeBadge>
              </div>
            </div>
          </div>
          <ArcadeBadge variant="success" size="xs" indicator pulse>
            {t("game.ready")}
          </ArcadeBadge>
        </div>
      </Card>
    </div>
  );
}
