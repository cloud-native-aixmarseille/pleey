import { useId, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ArcadePage } from "../../../../../presentation/shared/ui/components";
import type { Player } from "../../../../../domains/game/types";

import {
  LobbyHostBadge,
  LobbyBackground,
  LobbyHeader,
  usePlayerCountMessage,
} from ".";

import HostLobbyLayout from "./layouts/HostLobbyLayout";
import PlayerLobbyLayout from "./layouts/PlayerLobbyLayout";
import { GamePausedOverlay } from "../playing/components/GamePausedOverlay";
import { PausedHostBanner } from "../shared/PausedHostBanner";

const MAIN_CONTENT_CLASSES = "relative z-10 flex w-full flex-col gap-6";
const SR_ONLY_CLASSES = "sr-only";

interface LobbyPageProps {
  gamePin: string;
  players: Player[];
  isHost: boolean;
  isPaused?: boolean;
  quizTitle?: string | null;
  currentPlayerId?: number | string | null;
  currentPlayerUsername?: string | null;
  onStartGame: () => void;
  onStopSession?: () => void;
  onBackToHost?: () => void;
  onBack?: () => void;
  onTogglePause?: () => void;
  questionCount?: number;
  hostUserId?: number | null;
  hostUsername?: string | null;
}

export default function LobbyPage({
  gamePin,
  players,
  isHost,
  isPaused = false,
  quizTitle = null,
  currentPlayerId = null,
  currentPlayerUsername = null,
  onStartGame,
  onStopSession,
  onBackToHost,
  onBack,
  onTogglePause,
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
    if (!isHost) {
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
  }, [isHost, normalizedHostId, normalizedHostUsername]);

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

  const pinCharacters = useMemo(() => {
    const slots = Math.max(gamePin.length, 6);
    return Array.from({ length: slots }, (_, index) => ({
      value: gamePin[index] ?? "•",
      isPlaceholder: index >= gamePin.length,
    }));
  }, [gamePin]);
  const pinAriaLabel = `${t("game.enterPin")}: ${gamePin}`;

  const mustWaitForPlayers = visiblePlayers.length < 1;
  const hasQuestions = questionCount !== 0;
  const cannotStartGame = mustWaitForPlayers || !hasQuestions;
  const startButtonDescription =
    [
      mustWaitForPlayers ? startHintId : null,
      !hasQuestions ? questionHintId : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const showHostLayout = isHost;

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
          <div className={SR_ONLY_CLASSES} role="status" aria-live="polite">
            {playerCountMessage}
          </div>

          {isHost ? <LobbyHostBadge /> : null}

          {isHost && onTogglePause ? (
            <PausedHostBanner isPaused={isPaused} onResume={onTogglePause} />
          ) : null}

          <LobbyHeader titleId={lobbyTitleId} quizTitle={quizTitle} />

          {showHostLayout ? (
            <HostLobbyLayout
              gamePin={gamePin}
              instructionsTitleId={instructionsTitleId}
              pinCharacters={pinCharacters}
              pinAriaLabel={pinAriaLabel}
              copyFeedbackId={copyFeedbackId}
              players={visiblePlayers}
              playersSectionTitleId={playersSectionTitleId}
              highlightPlayerId={currentPlayerId}
              highlightPlayerUsername={currentPlayerUsername}
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
          ) : (
            <PlayerLobbyLayout
              gamePin={gamePin}
              pinAriaLabel={pinAriaLabel}
              onBack={onBack}
              players={visiblePlayers}
              playersSectionTitleId={playersSectionTitleId}
              highlightPlayerId={currentPlayerId}
              highlightPlayerUsername={currentPlayerUsername}
              startButtonDescription={startButtonDescription}
              startHintId={startHintId}
              questionHintId={questionHintId}
              mustWaitForPlayers={mustWaitForPlayers}
              hasQuestions={hasQuestions}
            />
          )}
        </main>
      </ArcadePage>

      {isPaused && !isHost ? <GamePausedOverlay /> : null}
    </div>
  );
}
