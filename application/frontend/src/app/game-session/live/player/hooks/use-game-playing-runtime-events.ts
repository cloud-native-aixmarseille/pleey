import { type MutableRefObject, useEffect } from 'react';
import {
  GameSessionPlayingRuntimeEventName,
  type GameSessionPlayingRuntimeHandler,
  type GameSessionPlayingRuntimePort,
} from '../../../../../application/game-session/live/player/ports/game-session-playing-runtime.port';

interface UseGamePlayingRuntimeEventsParams {
  readonly gamePlayingRuntime: GameSessionPlayingRuntimePort;
  readonly isAuthenticated: boolean;
  readonly sessionPin: string | null;
  readonly lastObservedSessionPinRef: MutableRefObject<string | null>;
  readonly handlePlayerJoined: GameSessionPlayingRuntimeHandler<GameSessionPlayingRuntimeEventName.PLAYER_JOINED>;
  readonly handleGameStarted: GameSessionPlayingRuntimeHandler<GameSessionPlayingRuntimeEventName.GAME_STARTED>;
  readonly handleNextStage: GameSessionPlayingRuntimeHandler<GameSessionPlayingRuntimeEventName.NEXT_STAGE>;
  readonly handleReturnedToLobby: GameSessionPlayingRuntimeHandler<GameSessionPlayingRuntimeEventName.RETURNED_TO_LOBBY>;
  readonly handleGamePaused: GameSessionPlayingRuntimeHandler<GameSessionPlayingRuntimeEventName.GAME_PAUSED>;
  readonly handleGameResumed: GameSessionPlayingRuntimeHandler<GameSessionPlayingRuntimeEventName.GAME_RESUMED>;
  readonly handleGameEnded: GameSessionPlayingRuntimeHandler<GameSessionPlayingRuntimeEventName.GAME_ENDED>;
  readonly handleActionAcknowledged: GameSessionPlayingRuntimeHandler<GameSessionPlayingRuntimeEventName.ACTION_ACKNOWLEDGED>;
  readonly handleActionResult: GameSessionPlayingRuntimeHandler<GameSessionPlayingRuntimeEventName.ACTION_RESULT>;
  readonly handleError: (error: unknown) => void;
}

export function useGamePlayingRuntimeEvents({
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
  handleError,
}: UseGamePlayingRuntimeEventsParams) {
  useEffect(() => {
    const resultRevealedHandler: GameSessionPlayingRuntimeHandler<
      GameSessionPlayingRuntimeEventName.RESULT_REVEALED
    > = (payload) => {
      handleActionResult(payload);
    };

    const errorHandler: GameSessionPlayingRuntimeHandler<
      GameSessionPlayingRuntimeEventName.ERROR
    > = (payload) => {
      handleError(payload.message ?? 'UNKNOWN');
    };

    gamePlayingRuntime.on(GameSessionPlayingRuntimeEventName.PLAYER_JOINED, handlePlayerJoined);
    gamePlayingRuntime.on(GameSessionPlayingRuntimeEventName.GAME_STARTED, handleGameStarted);
    gamePlayingRuntime.on(GameSessionPlayingRuntimeEventName.NEXT_STAGE, handleNextStage);
    if (isAuthenticated && sessionPin && lastObservedSessionPinRef.current === sessionPin) {
      gamePlayingRuntime.on(
        GameSessionPlayingRuntimeEventName.RESULT_REVEALED,
        resultRevealedHandler,
      );
    }
    gamePlayingRuntime.on(
      GameSessionPlayingRuntimeEventName.RETURNED_TO_LOBBY,
      handleReturnedToLobby,
    );
    gamePlayingRuntime.on(GameSessionPlayingRuntimeEventName.GAME_PAUSED, handleGamePaused);
    gamePlayingRuntime.on(GameSessionPlayingRuntimeEventName.GAME_RESUMED, handleGameResumed);
    gamePlayingRuntime.on(GameSessionPlayingRuntimeEventName.GAME_ENDED, handleGameEnded);
    gamePlayingRuntime.on(
      GameSessionPlayingRuntimeEventName.ACTION_ACKNOWLEDGED,
      handleActionAcknowledged,
    );
    gamePlayingRuntime.on(GameSessionPlayingRuntimeEventName.ACTION_RESULT, handleActionResult);
    gamePlayingRuntime.on(GameSessionPlayingRuntimeEventName.ERROR, errorHandler);

    return () => {
      gamePlayingRuntime.off(GameSessionPlayingRuntimeEventName.PLAYER_JOINED, handlePlayerJoined);
      gamePlayingRuntime.off(GameSessionPlayingRuntimeEventName.GAME_STARTED, handleGameStarted);
      gamePlayingRuntime.off(GameSessionPlayingRuntimeEventName.NEXT_STAGE, handleNextStage);
      if (isAuthenticated && sessionPin && lastObservedSessionPinRef.current === sessionPin) {
        gamePlayingRuntime.off(
          GameSessionPlayingRuntimeEventName.RESULT_REVEALED,
          resultRevealedHandler,
        );
      }
      gamePlayingRuntime.off(
        GameSessionPlayingRuntimeEventName.RETURNED_TO_LOBBY,
        handleReturnedToLobby,
      );
      gamePlayingRuntime.off(GameSessionPlayingRuntimeEventName.GAME_PAUSED, handleGamePaused);
      gamePlayingRuntime.off(GameSessionPlayingRuntimeEventName.GAME_RESUMED, handleGameResumed);
      gamePlayingRuntime.off(GameSessionPlayingRuntimeEventName.GAME_ENDED, handleGameEnded);
      gamePlayingRuntime.off(
        GameSessionPlayingRuntimeEventName.ACTION_ACKNOWLEDGED,
        handleActionAcknowledged,
      );
      gamePlayingRuntime.off(GameSessionPlayingRuntimeEventName.ACTION_RESULT, handleActionResult);
      gamePlayingRuntime.off(GameSessionPlayingRuntimeEventName.ERROR, errorHandler);
    };
  }, [
    gamePlayingRuntime,
    handlePlayerJoined,
    handleActionAcknowledged,
    handleActionResult,
    handleError,
    handleGameEnded,
    handleGamePaused,
    handleGameResumed,
    handleGameStarted,
    handleNextStage,
    handleReturnedToLobby,
    isAuthenticated,
    lastObservedSessionPinRef,
    sessionPin,
  ]);
}
