import { type PropsWithChildren, useCallback, useMemo, useRef, useState } from 'react';
import type { GameSessionHostControlRuntimePort } from '../../../../../application/game-session/live/host/ports/game-session-host-control-runtime.port';
import { GAME_SERVICE_ID } from '../../../../../application/game-session/live/shared/contracts/game-session-service-id';
import { GetActiveHostSessionByPinUseCase } from '../../../../../application/game-session/management/use-cases/get-active-host-session-by-pin-use-case';
import {
  type GameHostControlContextValue,
  GameHostControlProvider,
} from '../../../../../presentation/game-session/live/host/contexts/game-host-control-context';
import { useGamePlaying } from '../../../../../presentation/game-session/live/shared/contexts/game-playing-context';
import { runtimeContainer } from '../../../../composition/runtime-container';

const END_GAME_REDIRECT_POLL_INTERVAL_MS = 150;
const END_GAME_REDIRECT_MAX_ATTEMPTS = 10;

function waitForDelay(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
}

export function AppGameHostControlProvider({ children }: PropsWithChildren) {
  const servicesRef = useRef<{
    readonly hostControlRuntime: GameSessionHostControlRuntimePort;
    readonly getActiveHostSessionByPinUseCase: GetActiveHostSessionByPinUseCase;
  } | null>(null);

  if (!servicesRef.current) {
    servicesRef.current = {
      hostControlRuntime: runtimeContainer.get<GameSessionHostControlRuntimePort>(
        GAME_SERVICE_ID.gameHostControlRuntime,
      ),
      getActiveHostSessionByPinUseCase: runtimeContainer.get(GetActiveHostSessionByPinUseCase),
    };
  }

  const { hostControlRuntime, getActiveHostSessionByPinUseCase } = servicesRef.current;
  const { currentStage, isPaused, sessionPin, totalStages, hasGameEnded, isHost } =
    useGamePlaying();

  const [isEndConfirmPending, setIsEndConfirmPending] = useState(false);

  const stagePosition = currentStage?.position ?? -1;
  const hasActiveStage = stagePosition >= 0 && totalStages > 0;
  const shouldReturnToLobbyFromCurrentStage = hasActiveStage && stagePosition <= 1;
  const canRewindStage = hasActiveStage && stagePosition > 1 && !hasGameEnded;
  const canReturnToLobby = stagePosition >= 0 && !hasGameEnded;

  const pauseGame = useCallback(() => {
    if (!sessionPin || !isHost) return;
    hostControlRuntime.pauseGame({ pin: sessionPin });
  }, [hostControlRuntime, isHost, sessionPin]);

  const resumeGame = useCallback(() => {
    if (!sessionPin || !isHost) return;
    hostControlRuntime.resumeGame({ pin: sessionPin });
  }, [hostControlRuntime, isHost, sessionPin]);

  const restartStage = useCallback(() => {
    if (!sessionPin || !isHost) return;
    hostControlRuntime.restartStage({ pin: sessionPin });
  }, [hostControlRuntime, isHost, sessionPin]);

  const rewindStage = useCallback(() => {
    if (!sessionPin || !isHost) return;
    hostControlRuntime.rewindStage({ pin: sessionPin });
  }, [hostControlRuntime, isHost, sessionPin]);

  const returnToLobby = useCallback(() => {
    if (!sessionPin || !isHost) return;
    hostControlRuntime.returnToLobby({ pin: sessionPin });
  }, [hostControlRuntime, isHost, sessionPin]);

  const nextStage = useCallback(() => {
    if (!sessionPin || !isHost) return;
    hostControlRuntime.nextStage({ pin: sessionPin });
  }, [hostControlRuntime, isHost, sessionPin]);

  const requestEndGame = useCallback(() => {
    setIsEndConfirmPending(true);
  }, []);

  const waitForEndedSessionToDisappear = useCallback(
    async (pin: string) => {
      const normalizedPin = pin.trim().toUpperCase();

      for (let attempt = 0; attempt < END_GAME_REDIRECT_MAX_ATTEMPTS; attempt += 1) {
        const session = await getActiveHostSessionByPinUseCase.execute(normalizedPin);

        if (session === null) {
          return;
        }

        await waitForDelay(END_GAME_REDIRECT_POLL_INTERVAL_MS);
      }
    },
    [getActiveHostSessionByPinUseCase],
  );

  const confirmEndGame = useCallback(() => {
    if (!sessionPin || !isHost) return;
    setIsEndConfirmPending(false);

    void (async () => {
      hostControlRuntime.endGame({ pin: sessionPin });
      await waitForEndedSessionToDisappear(sessionPin);
      globalThis.location.assign('/workspace/dashboard');
    })();
  }, [hostControlRuntime, isHost, sessionPin, waitForEndedSessionToDisappear]);

  const cancelEndGame = useCallback(() => {
    setIsEndConfirmPending(false);
  }, []);

  const value = useMemo<GameHostControlContextValue>(
    () => ({
      isHost,
      isPaused,
      canRewindStage,
      canReturnToLobby,
      shouldReturnToLobbyFromCurrentStage,
      isEndConfirmPending,
      pauseGame,
      resumeGame,
      restartStage,
      rewindStage,
      returnToLobby,
      nextStage,
      requestEndGame,
      confirmEndGame,
      cancelEndGame,
    }),
    [
      isHost,
      isPaused,
      canRewindStage,
      canReturnToLobby,
      shouldReturnToLobbyFromCurrentStage,
      isEndConfirmPending,
      pauseGame,
      resumeGame,
      restartStage,
      rewindStage,
      returnToLobby,
      nextStage,
      requestEndGame,
      confirmEndGame,
      cancelEndGame,
    ],
  );

  return <GameHostControlProvider value={value}>{children}</GameHostControlProvider>;
}
