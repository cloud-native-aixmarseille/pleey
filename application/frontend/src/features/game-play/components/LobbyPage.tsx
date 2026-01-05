import { useId, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ArcadePage } from "../../../shared/components";
import { Player } from "../../../shared/types";
import {
  AdminHostBadge,
  JoinOptionsSection,
  LobbyBackground,
  LobbyHeader,
  PlayersSection,
  StartControls,
  useCopyGamePin,
  useJoinLink,
  usePlayerCountMessage,
} from "./lobby";

const MAIN_CONTENT_CLASSES = "relative z-10 flex w-full flex-col gap-6";
const SR_ONLY_CLASSES = "sr-only";

interface LobbyPageProps {
  gamePin: string;
  players: Player[];
  isAdmin: boolean;
  onStartGame: () => void;
  onStopSession?: () => void;
  onBackToAdmin?: () => void;
  questionCount?: number;
  hostUserId?: number | null;
  hostUsername?: string | null;
}

export default function LobbyPage({
  gamePin,
  players,
  isAdmin,
  onStartGame,
  onStopSession,
  onBackToAdmin,
  questionCount = 0,
  hostUserId = null,
  hostUsername = null,
}: LobbyPageProps) {
  const { t } = useTranslation();

  const lobbyTitleId = useId();
  const instructionsTitleId = useId();
  const playersSectionTitleId = useId();
  const startHintId = useId();
  const questionHintId = useId();
  const copyFeedbackId = useId();

  const normalizedHostId = hostUserId != null ? String(hostUserId) : null;
  const normalizedHostUsername = hostUsername
    ? hostUsername.trim().toLowerCase()
    : null;

  const hostIdentifiers = useMemo(() => {
    if (!isAdmin) {
      return null;
    }

    const identifiers = new Set<string>();

    if (normalizedHostId) {
      identifiers.add(normalizedHostId);
    }

    if (normalizedHostUsername) {
      identifiers.add(normalizedHostUsername);
    }

    return identifiers.size > 0 ? identifiers : null;
  }, [isAdmin, normalizedHostId, normalizedHostUsername]);

  const visiblePlayers = useMemo(() => {
    if (!hostIdentifiers) {
      return players;
    }

    return players.filter((player) => {
      const candidateValues: string[] = [];

      if (player.id !== null && player.id !== undefined) {
        candidateValues.push(String(player.id).trim().toLowerCase());
      }

      if (typeof player.username === "string") {
        candidateValues.push(player.username.trim().toLowerCase());
      }

      return candidateValues.every((value) => !hostIdentifiers.has(value));
    });
  }, [hostIdentifiers, players]);

  const playerCountMessage = usePlayerCountMessage(visiblePlayers.length, {
    initial: (totalPlayers) =>
      totalPlayers === 0
        ? t("game.noPlayersYet")
        : `${totalPlayers} ${
            totalPlayers !== 1 ? t("game.playersReady") : t("game.playerReady")
          }`,
    joined: (delta, totalPlayers) =>
      `${delta} ${
        delta > 1 ? t("game.newPlayersJoined") : t("game.newPlayerJoined")
      } ${totalPlayers} ${t("game.totalPlayers")}`,
    left: (delta, totalPlayers) =>
      `${delta} ${
        delta > 1 ? t("game.playersLeft") : t("game.playerLeft")
      } ${totalPlayers} ${t("game.remainingPlayers")}`,
  });

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
  const pinCharacters = useMemo(() => {
    const slots = Math.max(gamePin.length, 6);
    return Array.from({ length: slots }, (_, index) => ({
      value: gamePin[index] ?? "•",
      isPlaceholder: index >= gamePin.length,
    }));
  }, [gamePin]);
  const pinAriaLabel = `${t("game.enterPin")}: ${gamePin}`;

  const mustWaitForPlayers = visiblePlayers.length < 1;
  const hasQuestions = questionCount > 0;
  const cannotStartGame = mustWaitForPlayers || !hasQuestions;
  const startButtonDescription =
    [
      mustWaitForPlayers ? startHintId : null,
      !hasQuestions ? questionHintId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const { copiedPin, copyStatusMessage, copyPinToClipboard } = useCopyGamePin({
    gamePin,
    messages: {
      success: () => t("game.clipboardCopied"),
      error: () => t("game.clipboardError", { pin: gamePin }),
    },
  });

  return (
    <div data-lobby-page="true">
      <ArcadePage
        variant="gradient"
        padding="sm"
        disableVerticalPadding
        contentWidth="full"
        gap="md"
        verticalAlign="start"
        fitViewport
        overlays={<LobbyBackground />}
      >
        <main
          role="main"
          aria-labelledby={lobbyTitleId}
          className={MAIN_CONTENT_CLASSES}
        >
          <div
            className={SR_ONLY_CLASSES}
            role="status"
            aria-live="assertive"
            id={copyFeedbackId}
          >
            {copyStatusMessage}
          </div>
          <div className={SR_ONLY_CLASSES} role="status" aria-live="polite">
            {playerCountMessage}
          </div>

          {isAdmin ? <AdminHostBadge /> : null}

          <LobbyHeader titleId={lobbyTitleId} />

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
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
              players={visiblePlayers}
              sectionTitleId={playersSectionTitleId}
            />

            <div className="xl:col-span-2 w-full">
              <StartControls
                isAdmin={isAdmin}
                cannotStartGame={cannotStartGame}
                onStartGame={onStartGame}
                onStopSession={onStopSession}
                onBackToAdmin={onBackToAdmin}
                startButtonDescription={startButtonDescription}
                startHintId={startHintId}
                questionHintId={questionHintId}
                mustWaitForPlayers={mustWaitForPlayers}
                hasQuestions={hasQuestions}
              />
            </div>
          </div>
        </main>
      </ArcadePage>
    </div>
  );
}
