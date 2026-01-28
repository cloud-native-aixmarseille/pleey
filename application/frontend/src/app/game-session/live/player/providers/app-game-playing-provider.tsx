import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { type GameSessionPlayingRuntimePort } from '../../../../../application/game-session/live/player/ports/game-session-playing-runtime.port';
import { GAME_SERVICE_ID } from '../../../../../application/game-session/live/shared/contracts/game-session-service-id';
import { GetActiveHostSessionByPinUseCase } from '../../../../../application/game-session/management/use-cases/get-active-host-session-by-pin-use-case';
import { LeaveCurrentPlayerSessionUseCase } from '../../../../../application/game-session/management/use-cases/leave-current-player-session-use-case';
import { GamePlayingErrorResolutionService } from '../../../../../domains/game-session/services/game-playing-error-resolution.service';
import {
  type GamePlayingContextValue,
  GamePlayingProvider,
} from '../../../../../presentation/game-session/live/shared/contexts/game-playing-context';
import { useAuth } from '../../../../../presentation/identity/contexts/auth-context';
import { runtimeContainer } from '../../../../composition/runtime-container';
import { useAppGamePlayingRuntimeState } from '../hooks/use-app-game-playing-runtime-state';
import { useGamePlayingActionSubmission } from '../hooks/use-game-playing-action-submission';
import { useGamePlayingRuntimeEvents } from '../hooks/use-game-playing-runtime-events';
import { useGameSessionActivation } from '../hooks/use-game-session-activation';
import { useGameSessionReplay } from '../hooks/use-game-session-replay';
import { AppGameSessionRejoinRuntime } from '../runtimes/app-game-session-rejoin-runtime';
import { AppGuestPlayerRuntime } from '../runtimes/app-guest-player-runtime';

export function AppGamePlayingProvider({ children }: PropsWithChildren) {
  const servicesRef = useRef<{
    readonly guestPlayerService: AppGuestPlayerRuntime;
    readonly gamePlayingRuntime: GameSessionPlayingRuntimePort;
    readonly gameSessionRejoinService: AppGameSessionRejoinRuntime;
    readonly gamePlayingErrorResolutionService: GamePlayingErrorResolutionService;
    readonly getActiveHostSessionByPinUseCase: GetActiveHostSessionByPinUseCase;
    readonly leaveCurrentPlayerSessionUseCase: LeaveCurrentPlayerSessionUseCase;
  } | null>(null);

  if (!servicesRef.current) {
    servicesRef.current = {
      guestPlayerService: runtimeContainer.get(AppGuestPlayerRuntime),
      gamePlayingRuntime: runtimeContainer.get<GameSessionPlayingRuntimePort>(
        GAME_SERVICE_ID.gamePlayingRuntime,
      ),
      gameSessionRejoinService: runtimeContainer.get(AppGameSessionRejoinRuntime),
      gamePlayingErrorResolutionService: runtimeContainer.get(GamePlayingErrorResolutionService),
      getActiveHostSessionByPinUseCase: runtimeContainer.get(GetActiveHostSessionByPinUseCase),
      leaveCurrentPlayerSessionUseCase: runtimeContainer.get(LeaveCurrentPlayerSessionUseCase),
    };
  }

  const {
    guestPlayerService,
    gamePlayingRuntime,
    gameSessionRejoinService,
    gamePlayingErrorResolutionService,
    getActiveHostSessionByPinUseCase,
    leaveCurrentPlayerSessionUseCase,
  } = servicesRef.current;
  const { isAuthenticated, user } = useAuth();
  const userId = user?.id ?? null;
  const {
    activePlayerCount,
    gameTitle,
    gameType,
    currentGameType,
    currentStage,
    totalStages,
    timeLeft,
    selectedActionId,
    actionSubmitted,
    actionResult,
    hasGameEnded,
    isPaused,
    isResultTransitionActive,
    errorCode,
    resetSession,
    handlePlayerJoined,
    handleGameStarted,
    handleNextStage,
    handleReturnedToLobby,
    handleGamePaused,
    handleGameResumed,
    handleGameEnded,
    handleActionAcknowledged,
    handleActionResult,
    handleError,
    selectAction,
    clearError,
    leaderboard,
    isHost,
    syncHostOwnershipContext,
  } = useAppGamePlayingRuntimeState({
    hostOwnershipContext: { sessionPin: null, userId },
    getActiveHostSessionByPinUseCase,
  });

  const handleResolvedError = useCallback(
    (error: unknown) => {
      handleError(gamePlayingErrorResolutionService.resolve(error));
    },
    [gamePlayingErrorResolutionService, handleError],
  );

  const { lastObservedSessionPinRef, replaySession } = useGameSessionReplay({
    gameSessionRejoinService,
    observeSession: (normalizedPin) => {
      gamePlayingRuntime.observeSession?.(normalizedPin);
    },
  });

  const { sessionPin, activateSession } = useGameSessionActivation({
    currentSessionNeedsReset: hasGameEnded || errorCode !== null,
    onSessionChange: resetSession,
    onSessionActivated: replaySession,
  });

  useEffect(() => {
    syncHostOwnershipContext({ sessionPin, userId });
  }, [sessionPin, syncHostOwnershipContext, userId]);

  useGamePlayingRuntimeEvents({
    gamePlayingRuntime,
    isAuthenticated,
    sessionPin,
    lastObservedSessionPinRef,
    handlePlayerJoined,
    handleGameStarted,
    handleNextStage,
    handleReturnedToLobby,
    handleGamePaused,
    handleGameResumed,
    handleGameEnded,
    handleActionAcknowledged,
    handleActionResult,
    handleError: handleResolvedError,
  });

  const submitAction = useGamePlayingActionSubmission({
    actionSubmitted,
    gamePlayingRuntime,
    guestPlayerService,
    isAuthenticated,
    selectAction,
    sessionPin,
    timeLeft,
    userId: user?.id,
  });

  const leaveSession = useCallback(async () => {
    if (isAuthenticated) {
      await leaveCurrentPlayerSessionUseCase.execute();
    }
  }, [isAuthenticated, leaveCurrentPlayerSessionUseCase]);

  const value = useMemo<GamePlayingContextValue>(
    () => ({
      activePlayerCount,
      actionResult,
      actionSubmitted,
      currentGameType,
      gameType,
      gameTitle,
      currentStage,
      errorCode,
      hasGameEnded,
      isHost,
      isPaused,
      isResultTransitionActive,
      selectedActionId,
      sessionPin,
      timeLeft,
      totalStages,
      activateSession,
      clearError,
      leaveSession,
      submitAction,
      leaderboard,
    }),
    [
      activePlayerCount,
      actionResult,
      actionSubmitted,
      activateSession,
      clearError,
      currentGameType,
      gameType,
      gameTitle,
      currentStage,
      errorCode,
      hasGameEnded,
      isHost,
      isPaused,
      isResultTransitionActive,
      leaveSession,
      selectedActionId,
      sessionPin,
      submitAction,
      timeLeft,
      totalStages,
      leaderboard,
    ],
  );

  return <GamePlayingProvider value={value}>{children}</GamePlayingProvider>;
}
