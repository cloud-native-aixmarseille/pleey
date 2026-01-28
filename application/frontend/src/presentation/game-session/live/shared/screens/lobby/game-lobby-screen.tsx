import { SimpleGrid } from '@mantine/core';
import { useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GameLobbyStatus } from '../../../../../../application/game-session/live/shared/contracts/lobby-state';
import { useAuth } from '../../../../../identity/contexts/auth-context';
import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { useGameSessionRoutes } from '../../../../../shared/routing/game-session-route-context';
import { StatusBanner } from '../../../../../shared/ui/feedback/status-banner';
import { useGameJoin } from '../../contexts/game-join-context';
import { useGameLobby } from '../../contexts/game-lobby-context';
import { useGameLobbyState } from '../../contexts/game-lobby-state-context';
import { useGameTypeLiveRegistry } from '../../contexts/game-type-live-registry-context';
import { LobbyJoinPanel } from './components/lobby-join-panel';
import { LobbyPlayerGrid } from './components/lobby-player-grid';
import { LobbyStatusBar } from './components/lobby-status-bar';

export function GameLobbyScreen() {
  const { joinGameFlow: flowService, guestNickname, lastJoinRequest } = useGameJoin();
  const gameLobbyState = useGameLobbyState();
  const { t } = usePresentationTranslation();
  const { resolveJoinRoute } = useGameSessionRoutes();
  const registry = useGameTypeLiveRegistry();
  const { sessionPin } = useParams<{ sessionPin: string }>();
  const { hasRestoredSession, isAuthenticated, user } = useAuth();
  const {
    errorCode,
    gameType,
    gameTitle,
    hasGameStarted,
    hasReceivedRoster,
    isHost,
    players,
    sessionPin: activePin,
    buildJoinUrl,
    startGame,
    leaveSession,
  } = useGameLobby();

  const navigate = useNavigate();
  const gameJoinRoute = resolveJoinRoute();
  const normalizedSessionPin = (sessionPin ?? '').trim().toUpperCase();
  const hasIdentity = flowService.hasPlayerIdentity(isAuthenticated, guestNickname);
  const joinUrl = buildJoinUrl(activePin ?? normalizedSessionPin);
  const gameTypeTitleKey = gameType ? registry.resolve(gameType).titleKey : null;

  const lobbyState = useMemo(
    () =>
      gameLobbyState.execute({
        activePin: activePin ?? normalizedSessionPin,
        errorCode,
        guestNickname,
        hasGameStarted,
        hasReceivedRoster,
        hasIdentity,
        hasRestoredSession,
        isAuthenticated,
        authenticatedAvatarUri: user?.avatarUri ?? null,
        lastJoinRequest,
        players,
        userId: user?.id ?? null,
        username: user?.username ?? null,
      }),
    [
      activePin,
      errorCode,
      gameLobbyState,
      guestNickname,
      hasGameStarted,
      hasReceivedRoster,
      isAuthenticated,
      hasIdentity,
      hasRestoredSession,
      lastJoinRequest,
      normalizedSessionPin,
      players,
      user,
    ],
  );

  const handleLeaveSession = useCallback(() => {
    void (async () => {
      await leaveSession();
      navigate(gameJoinRoute, { replace: true });
    })();
  }, [gameJoinRoute, leaveSession, navigate]);

  if (
    lobbyState.status === GameLobbyStatus.LOADING ||
    lobbyState.status === GameLobbyStatus.REDIRECT
  ) {
    return (
      <>
        <StatusBanner tone="info">{t('game.lobby.syncingRoster')}</StatusBanner>
      </>
    );
  }

  const displayPin = lobbyState.pinCharacters.map((c) => c.value).join('');

  return (
    <>
      <LobbyStatusBar
        errorMessage={
          lobbyState.unknownErrorMessageKey ? t(lobbyState.unknownErrorMessageKey) : null
        }
        gameTypeTitleKey={gameTypeTitleKey}
        gameTitle={gameTitle}
        isHost={isHost}
        onStartGame={startGame}
        onLeaveSession={handleLeaveSession}
      />

      <SimpleGrid cols={{ base: 1, md: isHost ? 2 : 1 }} spacing="lg">
        {isHost ? <LobbyJoinPanel sessionPin={displayPin} joinUrl={joinUrl} /> : null}
        <LobbyPlayerGrid
          highlightedPlayers={lobbyState.highlightedPlayers}
          playerCount={lobbyState.playerCount}
        />
      </SimpleGrid>
    </>
  );
}
