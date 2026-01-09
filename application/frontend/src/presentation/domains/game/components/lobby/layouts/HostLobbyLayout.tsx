import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { Player } from "../../../../../../domains/game/types";

import {
  JoinOptionsSection,
  PlayersSection,
  StartControls,
  useCopyGamePin,
  useJoinLink,
} from "..";

const SR_ONLY_CLASSES = "sr-only";

interface HostLobbyLayoutProps {
  readonly gamePin: string;
  readonly instructionsTitleId: string;
  readonly pinCharacters: ReadonlyArray<{
    value: string;
    isPlaceholder: boolean;
  }>;
  readonly pinAriaLabel: string;
  readonly copyFeedbackId: string;
  readonly players: readonly Player[];
  readonly playersSectionTitleId: string;
  readonly highlightPlayerId?: number | string | null;
  readonly highlightPlayerUsername?: string | null;
  readonly cannotStartGame: boolean;
  readonly onStartGame: () => void;
  readonly onStopSession?: () => void;
  readonly onBackToHost?: () => void;
  readonly startButtonDescription?: string;
  readonly startHintId: string;
  readonly questionHintId: string;
  readonly mustWaitForPlayers: boolean;
  readonly hasQuestions: boolean;
}

export default function HostLobbyLayout({
  gamePin,
  instructionsTitleId,
  pinCharacters,
  pinAriaLabel,
  copyFeedbackId,
  players,
  playersSectionTitleId,
  highlightPlayerId,
  highlightPlayerUsername,
  cannotStartGame,
  onStartGame,
  onStopSession,
  onBackToHost,
  startButtonDescription,
  startHintId,
  questionHintId,
  mustWaitForPlayers,
  hasQuestions,
}: HostLobbyLayoutProps) {
  const { t } = useTranslation();

  const joinUrl = useJoinLink();
  const joinLink = useMemo(
    () => (joinUrl ? `${joinUrl}?pin=${gamePin}` : null),
    [joinUrl, gamePin]
  );
  const joinUrlForDisplay = useMemo(
    () => (joinUrl ? joinUrl.replace(/^https?:\/\//, "") : ""),
    [joinUrl]
  );
  const manualJoinInstructions = useMemo(
    () =>
      joinUrl
        ? t("game.joinStepManualDescription", { url: joinUrlForDisplay })
        : t("game.howToJoinStep1"),
    [joinUrl, joinUrlForDisplay, t]
  );

  const { copiedPin, copyStatusMessage, copyPinToClipboard } = useCopyGamePin({
    gamePin,
    messages: {
      success: () => t("game.clipboardCopied"),
      error: () => t("game.clipboardError", { pin: gamePin }),
    },
  });

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
      <div
        className={SR_ONLY_CLASSES}
        role="status"
        aria-live="assertive"
        id={copyFeedbackId}
      >
        {copyStatusMessage}
      </div>

      <JoinOptionsSection
        instructionsTitleId={instructionsTitleId}
        gamePin={gamePin}
        joinLink={joinLink}
        joinUrlForDisplay={joinUrlForDisplay}
        manualJoinInstructions={manualJoinInstructions}
        pinCharacters={pinCharacters}
        pinAriaLabel={pinAriaLabel}
        copyFeedbackId={copyFeedbackId}
        copyStatusMessage={copyStatusMessage}
        copiedPin={copiedPin}
        copyPinToClipboard={copyPinToClipboard}
      />

      <PlayersSection
        players={players}
        sectionTitleId={playersSectionTitleId}
        highlightPlayerId={highlightPlayerId}
        highlightPlayerUsername={highlightPlayerUsername}
      />

      <div className="xl:col-span-2 w-full">
        <StartControls
          isHost
          cannotStartGame={cannotStartGame}
          onStartGame={onStartGame}
          onStopSession={onStopSession}
          onBackToHost={onBackToHost}
          startButtonDescription={startButtonDescription}
          startHintId={startHintId}
          questionHintId={questionHintId}
          mustWaitForPlayers={mustWaitForPlayers}
          hasQuestions={hasQuestions}
        />
      </div>
    </div>
  );
}
