import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  GameSessionLobbyRuntimeEventName,
  type GameSessionLobbyRuntimeHandler,
  type GameSessionLobbyRuntimePort,
} from '../../../../../application/game-session/live/player/ports/game-session-lobby-runtime.port';
import { GAME_SERVICE_ID } from '../../../../../application/game-session/live/shared/contracts/game-session-service-id';
import { GetActiveHostSessionByPinUseCase } from '../../../../../application/game-session/management/use-cases/get-active-host-session-by-pin-use-case';
import { LeaveCurrentPlayerSessionUseCase } from '../../../../../application/game-session/management/use-cases/leave-current-player-session-use-case';
import { GameLobbyErrorResolutionService } from '../../../../../domains/game-session/services/game-lobby-error-resolution.service';
import { GameSessionRoutingService } from '../../../../../domains/game-session/services/game-session-routing-service';
import {
  type GameLobbyContextValue,
  GameLobbyProvider,
} from '../../../../../presentation/game-session/live/shared/contexts/game-lobby-context';
import { useGameLobbyRuntimeState } from '../../../../../presentation/game-session/live/shared/hooks/use-game-lobby-runtime-state';
import { useAuth } from '../../../../../presentation/identity/contexts/auth-context';
import { runtimeContainer } from '../../../../composition/runtime-container';
import { useGameSessionActivation } from '../hooks/use-game-session-activation';
import { useGameSessionReplay } from '../hooks/use-game-session-replay';
import { AppGameSessionRejoinRuntime } from '../runtimes/app-game-session-rejoin-runtime';

function buildAbsoluteJoinUrl(pin: string): string {
  const gameSessionRoutingService = runtimeContainer.get(GameSessionRoutingService);
  const joinRoute = gameSessionRoutingService.resolveJoinRoute(pin);

  if (typeof window !== 'undefined' && window.location?.origin) {
    return new URL(joinRoute, window.location.origin).toString();
  }

  return joinRoute;
}

export function AppGameLobbyProvider({ children }: PropsWithChildren) {
  const servicesRef = useRef<{
    readonly gameLobbyRuntime: GameSessionLobbyRuntimePort;
    readonly gameSessionRejoinService: AppGameSessionRejoinRuntime;
    readonly gameLobbyErrorResolutionService: GameLobbyErrorResolutionService;
    readonly getActiveHostSessionByPinUseCase: GetActiveHostSessionByPinUseCase;
    readonly leaveCurrentPlayerSessionUseCase: LeaveCurrentPlayerSessionUseCase;
  } | null>(null);

  if (!servicesRef.current) {
    servicesRef.current = {
      gameLobbyRuntime: runtimeContainer.get<GameSessionLobbyRuntimePort>(
        GAME_SERVICE_ID.gameLobbyRuntime,
      ),
      gameSessionRejoinService: runtimeContainer.get(AppGameSessionRejoinRuntime),
      gameLobbyErrorResolutionService: runtimeContainer.get(GameLobbyErrorResolutionService),
      getActiveHostSessionByPinUseCase: runtimeContainer.get(GetActiveHostSessionByPinUseCase),
      leaveCurrentPlayerSessionUseCase: runtimeContainer.get(LeaveCurrentPlayerSessionUseCase),
    };
  }

  const {
    gameLobbyRuntime,
    gameSessionRejoinService,
    gameLobbyErrorResolutionService,
    getActiveHostSessionByPinUseCase,
    leaveCurrentPlayerSessionUseCase,
  } = servicesRef.current;
  const { isAuthenticated, user } = useAuth();
  const [isHost, setIsHost] = useState(false);
  const {
    gameTitle,
    gameType,
    players,
    hasReceivedRoster,
    hasGameStarted,
    errorCode,
    resetSession,
    handlePlayerJoined,
    handleGameStarted,
    handleGameResumed,
    handleReturnedToLobby,
    handleError,
    clearError,
  } = useGameLobbyRuntimeState();

  const { replaySession, resetReplayState } = useGameSessionReplay({
    gameSessionRejoinService,
    observeSession: (normalizedPin) => {
      gameLobbyRuntime.observeSession(normalizedPin);
    },
  });

  useEffect(() => {
    const playerJoinedHandler: GameSessionLobbyRuntimeHandler<
      GameSessionLobbyRuntimeEventName.PLAYER_JOINED
    > = (payload) => {
      handlePlayerJoined(payload.players, payload.gameTitle, payload.gameType);
    };

    const gameStartedHandler: GameSessionLobbyRuntimeHandler<
      GameSessionLobbyRuntimeEventName.GAME_STARTED
    > = (payload) => {
      handleGameStarted(payload.gameTitle, payload.gameType);
    };

    const gameResumedHandler: GameSessionLobbyRuntimeHandler<
      GameSessionLobbyRuntimeEventName.GAME_RESUMED
    > = (payload) => {
      handleGameResumed(payload.gameTitle, payload.gameType);
    };

    const returnedToLobbyHandler: GameSessionLobbyRuntimeHandler<
      GameSessionLobbyRuntimeEventName.RETURNED_TO_LOBBY
    > = (payload) => {
      handleReturnedToLobby(payload.players, payload.gameTitle, payload.gameType);
    };

    const errorHandler: GameSessionLobbyRuntimeHandler<GameSessionLobbyRuntimeEventName.ERROR> = (
      payload,
    ) => {
      handleError(gameLobbyErrorResolutionService.resolve(payload.message ?? 'UNKNOWN'));
    };

    gameLobbyRuntime.on(GameSessionLobbyRuntimeEventName.PLAYER_JOINED, playerJoinedHandler);
    gameLobbyRuntime.on(GameSessionLobbyRuntimeEventName.GAME_STARTED, gameStartedHandler);
    gameLobbyRuntime.on(GameSessionLobbyRuntimeEventName.GAME_RESUMED, gameResumedHandler);
    gameLobbyRuntime.on(GameSessionLobbyRuntimeEventName.RETURNED_TO_LOBBY, returnedToLobbyHandler);
    gameLobbyRuntime.on(GameSessionLobbyRuntimeEventName.ERROR, errorHandler);

    return () => {
      gameLobbyRuntime.off(GameSessionLobbyRuntimeEventName.PLAYER_JOINED, playerJoinedHandler);
      gameLobbyRuntime.off(GameSessionLobbyRuntimeEventName.GAME_STARTED, gameStartedHandler);
      gameLobbyRuntime.off(GameSessionLobbyRuntimeEventName.GAME_RESUMED, gameResumedHandler);
      gameLobbyRuntime.off(
        GameSessionLobbyRuntimeEventName.RETURNED_TO_LOBBY,
        returnedToLobbyHandler,
      );
      gameLobbyRuntime.off(GameSessionLobbyRuntimeEventName.ERROR, errorHandler);
    };
  }, [
    handleError,
    handleGameResumed,
    handleGameStarted,
    handlePlayerJoined,
    handleReturnedToLobby,
    gameLobbyErrorResolutionService,
  ]);

  const { sessionPin, activateSession } = useGameSessionActivation({
    currentSessionNeedsReset: hasGameStarted || errorCode !== null,
    onSessionChange: resetSession,
    onSessionActivated: replaySession,
  });

  const normalizedSessionPin = sessionPin?.trim().toUpperCase() ?? '';

  useEffect(() => {
    if (!isAuthenticated || !user || !normalizedSessionPin) {
      setIsHost(false);
      return;
    }

    let isCancelled = false;

    void (async () => {
      try {
        const session = await getActiveHostSessionByPinUseCase.execute(normalizedSessionPin);

        if (isCancelled) {
          return;
        }

        setIsHost(session !== null);
      } catch {
        if (!isCancelled) {
          setIsHost(false);
        }
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [getActiveHostSessionByPinUseCase, isAuthenticated, normalizedSessionPin, user]);

  const startGame = useCallback(() => {
    if (sessionPin) {
      gameLobbyRuntime.startGame(sessionPin);
    }
  }, [sessionPin]);

  const leaveSession = useCallback(async () => {
    resetReplayState();
    if (isAuthenticated) {
      await leaveCurrentPlayerSessionUseCase.execute();
    }
    gameLobbyRuntime.disconnect();
  }, [gameLobbyRuntime, isAuthenticated, leaveCurrentPlayerSessionUseCase, resetReplayState]);

  const value = useMemo<GameLobbyContextValue>(
    () => ({
      gameType,
      gameTitle,
      sessionPin,
      players,
      hasReceivedRoster,
      hasGameStarted,
      isHost,
      errorCode,
      buildJoinUrl: (pin: string) => buildAbsoluteJoinUrl(pin),
      activateSession,
      clearError,
      startGame,
      leaveSession,
    }),
    [
      activateSession,
      clearError,
      errorCode,
      gameType,
      gameTitle,
      hasGameStarted,
      hasReceivedRoster,
      isHost,
      leaveSession,
      players,
      sessionPin,
      startGame,
    ],
  );

  return <GameLobbyProvider value={value}>{children}</GameLobbyProvider>;
}
