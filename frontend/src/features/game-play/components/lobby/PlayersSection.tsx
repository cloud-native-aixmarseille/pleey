import { memo, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card } from "../../../../shared/components";
import { Player } from "../../../../shared/types";

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
    <section aria-labelledby={sectionTitleId}>
      <div className="flex items-center justify-center gap-3 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
        <h2
          id={sectionTitleId}
          className="font-display text-base sm:text-xl text-primary-300 uppercase tracking-wider flex items-center gap-2"
        >
          <span>{t("game.connectedPlayers")}</span>
          <span className="glass-effect rounded-full px-3 py-1 text-sm sm:text-lg border-2 border-accent-500/30 text-accent-400">
            {playerCount}
          </span>
        </h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
      </div>

      {playerCount > 0 ? (
        <ul
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 list-none"
          aria-label={t("game.connectedPlayers")}
        >
          {players.map((player, index) => (
            <li key={player.id} className="list-none">
              <Card
                hover
                className="p-4 sm:p-6 text-center animate-scale-in border-2 border-accent-500/20 hover:border-accent-500"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="text-4xl sm:text-5xl mb-3 animate-bounce-slow flex justify-center">
                  <img
                    src={player.avatar}
                    alt={`Avatar for ${player.username}`}
                    className="w-16 h-16 sm:w-20 sm:h-20"
                  />
                </div>
                <div
                  className="font-mono text-xs sm:text-sm text-accent-400 truncate font-bold uppercase"
                  title={player.username}
                >
                  {player.username}
                </div>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-success-500/20 border border-success-500 text-success-400 rounded-lg text-xxs sm:text-xs font-mono uppercase">
                  <span
                    className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse"
                    aria-hidden="true"
                  />
                  <span>{t("game.ready")}</span>
                </div>
              </Card>
            </li>
          ))}

          {fillerSlots.map((_, index) => (
            <li key={`empty-${index}`} className="list-none">
              <Card
                className="p-4 sm:p-6 text-center opacity-20 border-2 border-dashed border-primary-500/30"
                aria-hidden="true"
              >
                <div className="text-4xl sm:text-5xl mb-3">👤</div>
                <div className="font-mono text-xxs sm:text-xs text-light-600 uppercase">
                  {t("game.waiting")}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-12" role="status" aria-live="polite">
          <div
            className="text-6xl sm:text-8xl mb-4 opacity-30 animate-pulse-slow"
            aria-hidden="true"
          >
            👥
          </div>
          <p className="font-display text-lg sm:text-xl text-primary-400 uppercase mb-2">
            {t("game.noPlayersYetTitle")}
          </p>
          <p className="font-mono text-xs sm:text-sm text-light-500">
            {t("game.sharePin")}
          </p>
        </div>
      )}
    </section>
  );
}

const PlayersSection = memo(PlayersSectionComponent);

export default PlayersSection;
