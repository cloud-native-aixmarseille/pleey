import { useTranslation } from "react-i18next";

import { BackToButton } from "../../../../../../presentation/shared/ui/components";
import type { Player } from "../../../../../../domains/game/types";

import { PlayersSection, StartControls } from "..";

interface PlayerLobbyLayoutProps {
  readonly gamePin: string;
  readonly pinAriaLabel: string;
  readonly onBack?: () => void;
  readonly players: readonly Player[];
  readonly playersSectionTitleId: string;
  readonly highlightPlayerId?: number | string | null;
  readonly highlightPlayerUsername?: string | null;
  readonly startButtonDescription?: string;
  readonly startHintId: string;
  readonly questionHintId: string;
  readonly mustWaitForPlayers: boolean;
  readonly hasQuestions: boolean;
}

export default function PlayerLobbyLayout({
  gamePin,
  pinAriaLabel,
  onBack,
  players,
  playersSectionTitleId,
  highlightPlayerId,
  highlightPlayerUsername,
  startButtonDescription,
  startHintId,
  questionHintId,
  mustWaitForPlayers,
  hasQuestions,
}: PlayerLobbyLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {onBack ? (
          <div className="w-full sm:w-auto sm:max-w-xs">
            <BackToButton
              label={t("quiz.back").toUpperCase()}
              onClick={onBack}
              fullWidth
            />
          </div>
        ) : null}

        <div
          className="flex items-center justify-center sm:justify-end"
          role="status"
          aria-label={pinAriaLabel}
        >
          <span className="rounded-full border border-primary-500/35 bg-primary-500/10 px-4 py-2 font-mono text-sm uppercase tracking-[0.25em] text-primary-900 dark:text-primary-200">
            {gamePin}
          </span>
        </div>
      </div>

      <PlayersSection
        players={players}
        sectionTitleId={playersSectionTitleId}
        highlightPlayerId={highlightPlayerId}
        highlightPlayerUsername={highlightPlayerUsername}
      />

      <StartControls
        isHost={false}
        cannotStartGame
        onStartGame={() => undefined}
        startButtonDescription={startButtonDescription}
        startHintId={startHintId}
        questionHintId={questionHintId}
        mustWaitForPlayers={mustWaitForPlayers}
        hasQuestions={hasQuestions}
      />
    </div>
  );
}
