import { useCallback, useEffect, useReducer, useState } from 'react';
import type {
  GameSessionPlayingRuntimeEventMap,
  SubmitGameActionCommand,
} from '../../../../../application/game-session/live/player/ports/game-session-playing-runtime.port';
import { GameSessionPlayingRuntimeEventName } from '../../../../../application/game-session/live/player/ports/game-session-playing-runtime.port';
import { GetActiveHostSessionByPinUseCase } from '../../../../../application/game-session/management/use-cases/get-active-host-session-by-pin-use-case';
import type { LeaderboardEntry } from '../../../../../domains/game-session/entities/leaderboard-entry';
import { GamePlayingErrorCode } from '../../../../../domains/game-session/errors/game-playing-error-code';
import type { GamePlayingContextValue } from '../../../../../presentation/game-session/live/shared/contexts/game-playing-context';

interface GamePlayingRuntimeState {
  readonly activePlayerCount: number;
  readonly gameType: GamePlayingContextValue['gameType'];
  readonly gameTitle: GamePlayingContextValue['gameTitle'];
  readonly currentGameType: string | null;
  readonly currentStage: GamePlayingContextValue['currentStage'];
  readonly totalStages: number;
  readonly timeLeft: number | null;
  readonly selectedActionId: number | null;
  readonly actionSubmitted: boolean;
  readonly actionResult: GamePlayingContextValue['actionResult'];
  readonly pendingActionResult: GamePlayingContextValue['actionResult'];
  readonly isResultTransitionActive: boolean;
  readonly hasGameEnded: boolean;
  readonly isPaused: boolean;
  readonly errorCode: GamePlayingErrorCode | null;
  readonly leaderboard: readonly LeaderboardEntry[];
}

interface GamePlayingHostOwnershipContext {
  readonly sessionPin: string | null;
  readonly userId: number | null;
}

interface UseAppGamePlayingRuntimeStateOptions {
  readonly hostOwnershipContext: GamePlayingHostOwnershipContext;
  readonly getActiveHostSessionByPinUseCase: GetActiveHostSessionByPinUseCase;
}

const RESULT_TRANSITION_DELAY_MS = 1400;

enum GamePlayingRuntimeActionType {
  SESSION_RESET = 'session-reset',
  PLAYER_JOINED = 'player-joined',
  GAME_STARTED = 'game-started',
  NEXT_STAGE = 'next-stage',
  RETURNED_TO_LOBBY = 'returned-to-lobby',
  GAME_PAUSED = 'game-paused',
  GAME_RESUMED = 'game-resumed',
  GAME_ENDED = 'game-ended',
  ACTION_ACKNOWLEDGED = 'action-acknowledged',
  ACTION_RESULT = 'action-result',
  ACTION_RESULT_TRANSITION_COMPLETED = 'action-result-transition-completed',
  ACTION_SELECTED = 'action-selected',
  TIMER_TICKED = 'timer-ticked',
  ERROR = 'error',
  CLEAR_ERROR = 'clear-error',
}

type GamePlayingRuntimeAction =
  | { readonly type: GamePlayingRuntimeActionType.SESSION_RESET }
  | {
      readonly type: GamePlayingRuntimeActionType.PLAYER_JOINED;
      readonly payload: GameSessionPlayingRuntimeEventMap[GameSessionPlayingRuntimeEventName.PLAYER_JOINED];
    }
  | {
      readonly type: GamePlayingRuntimeActionType.GAME_STARTED;
      readonly payload: GameSessionPlayingRuntimeEventMap[GameSessionPlayingRuntimeEventName.GAME_STARTED];
    }
  | {
      readonly type: GamePlayingRuntimeActionType.NEXT_STAGE;
      readonly payload: GameSessionPlayingRuntimeEventMap[GameSessionPlayingRuntimeEventName.NEXT_STAGE];
    }
  | { readonly type: GamePlayingRuntimeActionType.RETURNED_TO_LOBBY }
  | {
      readonly type: GamePlayingRuntimeActionType.GAME_PAUSED;
      readonly payload: GameSessionPlayingRuntimeEventMap[GameSessionPlayingRuntimeEventName.GAME_PAUSED];
    }
  | {
      readonly type: GamePlayingRuntimeActionType.GAME_RESUMED;
      readonly payload: GameSessionPlayingRuntimeEventMap[GameSessionPlayingRuntimeEventName.GAME_RESUMED];
    }
  | {
      readonly type: GamePlayingRuntimeActionType.GAME_ENDED;
      readonly payload: GameSessionPlayingRuntimeEventMap[GameSessionPlayingRuntimeEventName.GAME_ENDED];
    }
  | { readonly type: GamePlayingRuntimeActionType.ACTION_ACKNOWLEDGED }
  | {
      readonly type: GamePlayingRuntimeActionType.ACTION_RESULT;
      readonly payload: GameSessionPlayingRuntimeEventMap[GameSessionPlayingRuntimeEventName.ACTION_RESULT];
    }
  | {
      readonly type: GamePlayingRuntimeActionType.ACTION_RESULT_TRANSITION_COMPLETED;
      readonly payload: GameSessionPlayingRuntimeEventMap[GameSessionPlayingRuntimeEventName.ACTION_RESULT];
    }
  | {
      readonly type: GamePlayingRuntimeActionType.ACTION_SELECTED;
      readonly actionId: SubmitGameActionCommand['actionId'];
    }
  | { readonly type: GamePlayingRuntimeActionType.TIMER_TICKED }
  | {
      readonly type: GamePlayingRuntimeActionType.ERROR;
      readonly errorCode: GamePlayingErrorCode;
    }
  | { readonly type: GamePlayingRuntimeActionType.CLEAR_ERROR };

const initialGamePlayingRuntimeState: GamePlayingRuntimeState = {
  activePlayerCount: 0,
  gameType: null,
  gameTitle: null,
  currentGameType: null,
  currentStage: null,
  totalStages: 0,
  timeLeft: null,
  selectedActionId: null,
  actionSubmitted: false,
  actionResult: null,
  pendingActionResult: null,
  isResultTransitionActive: false,
  hasGameEnded: false,
  isPaused: false,
  errorCode: null,
  leaderboard: [],
};

function gamePlayingRuntimeReducer(
  state: GamePlayingRuntimeState,
  action: GamePlayingRuntimeAction,
): GamePlayingRuntimeState {
  switch (action.type) {
    case GamePlayingRuntimeActionType.SESSION_RESET:
      return initialGamePlayingRuntimeState;
    case GamePlayingRuntimeActionType.PLAYER_JOINED:
      return {
        ...state,
        activePlayerCount: action.payload.players.length,
        gameType: action.payload.gameType,
        gameTitle: action.payload.gameTitle,
      };
    case GamePlayingRuntimeActionType.GAME_STARTED:
      return {
        ...state,
        activePlayerCount: action.payload.activePlayerCount,
        gameType: action.payload.gameType,
        gameTitle: action.payload.gameTitle,
        currentGameType: action.payload.gameType,
        currentStage: action.payload.stage,
        totalStages: action.payload.totalStages,
        timeLeft: action.payload.stage.timeLimit,
        selectedActionId: null,
        actionSubmitted: false,
        actionResult: null,
        pendingActionResult: null,
        isResultTransitionActive: false,
        hasGameEnded: false,
        isPaused: false,
        errorCode: null,
        leaderboard: [],
      };
    case GamePlayingRuntimeActionType.NEXT_STAGE:
      return {
        ...state,
        activePlayerCount: action.payload.activePlayerCount,
        gameType: action.payload.gameType,
        gameTitle: action.payload.gameTitle,
        currentGameType: action.payload.gameType,
        currentStage: action.payload.stage,
        timeLeft: action.payload.stage.timeLimit,
        selectedActionId: null,
        actionSubmitted: false,
        actionResult: null,
        pendingActionResult: null,
        isResultTransitionActive: false,
        hasGameEnded: false,
        isPaused: false,
        errorCode: null,
        leaderboard: [],
      };
    case GamePlayingRuntimeActionType.RETURNED_TO_LOBBY:
      return {
        ...state,
        activePlayerCount: 0,
        currentGameType: null,
        currentStage: null,
        timeLeft: null,
        selectedActionId: null,
        actionSubmitted: false,
        actionResult: null,
        pendingActionResult: null,
        isResultTransitionActive: false,
        hasGameEnded: false,
        isPaused: false,
        errorCode: null,
        leaderboard: [],
      };
    case GamePlayingRuntimeActionType.GAME_PAUSED:
      return {
        ...state,
        timeLeft: action.payload.timeLeft,
        isPaused: true,
      };
    case GamePlayingRuntimeActionType.GAME_RESUMED:
      return {
        ...state,
        activePlayerCount: action.payload.activePlayerCount,
        gameType: action.payload.gameType,
        gameTitle: action.payload.gameTitle,
        currentGameType: action.payload.gameType,
        currentStage: action.payload.stage,
        totalStages: action.payload.totalStages,
        timeLeft: action.payload.timeLeft ?? action.payload.stage.timeLimit,
        actionResult: null,
        pendingActionResult: null,
        isResultTransitionActive: false,
        hasGameEnded: false,
        isPaused: false,
        errorCode: null,
        leaderboard: [],
      };
    case GamePlayingRuntimeActionType.GAME_ENDED:
      return {
        ...state,
        activePlayerCount: 0,
        currentGameType: null,
        currentStage: null,
        timeLeft: null,
        actionResult: null,
        pendingActionResult: null,
        isResultTransitionActive: false,
        actionSubmitted: false,
        selectedActionId: null,
        hasGameEnded: true,
        isPaused: false,
        errorCode: null,
        leaderboard: action.payload.leaderboard,
      };
    case GamePlayingRuntimeActionType.ACTION_ACKNOWLEDGED:
      return {
        ...state,
        actionSubmitted: true,
      };
    case GamePlayingRuntimeActionType.ACTION_RESULT:
      if (state.currentStage !== null && state.actionResult === null) {
        return {
          ...state,
          pendingActionResult: action.payload,
          actionSubmitted: true,
          timeLeft: 0,
          isPaused: false,
          isResultTransitionActive: true,
          errorCode: null,
        };
      }

      return {
        ...state,
        actionResult: action.payload,
        pendingActionResult: null,
        actionSubmitted: true,
        timeLeft: 0,
        isResultTransitionActive: false,
        isPaused: false,
        errorCode: null,
      };
    case GamePlayingRuntimeActionType.ACTION_RESULT_TRANSITION_COMPLETED:
      return {
        ...state,
        actionResult: action.payload,
        pendingActionResult: null,
        isResultTransitionActive: false,
        actionSubmitted: true,
        timeLeft: 0,
        isPaused: false,
        errorCode: null,
      };
    case GamePlayingRuntimeActionType.ACTION_SELECTED:
      return {
        ...state,
        selectedActionId: action.actionId,
        errorCode: null,
      };
    case GamePlayingRuntimeActionType.TIMER_TICKED:
      return {
        ...state,
        timeLeft: state.timeLeft === null || state.timeLeft <= 1 ? 0 : state.timeLeft - 1,
      };
    case GamePlayingRuntimeActionType.ERROR:
      return {
        ...state,
        errorCode: action.errorCode,
      };
    case GamePlayingRuntimeActionType.CLEAR_ERROR:
      return {
        ...state,
        errorCode: null,
      };
  }
}

export function useAppGamePlayingRuntimeState(options: UseAppGamePlayingRuntimeStateOptions) {
  const { hostOwnershipContext, getActiveHostSessionByPinUseCase } = options;
  const [state, dispatch] = useReducer(gamePlayingRuntimeReducer, initialGamePlayingRuntimeState);
  const [currentHostOwnershipContext, setCurrentHostOwnershipContext] =
    useState<GamePlayingHostOwnershipContext>(hostOwnershipContext);
  const [isHost, setIsHost] = useState(false);

  const syncHostOwnershipContext = useCallback((nextContext: GamePlayingHostOwnershipContext) => {
    setCurrentHostOwnershipContext((previousContext) => {
      const previousNormalizedPin = previousContext.sessionPin?.trim().toUpperCase() ?? '';
      const nextNormalizedPin = nextContext.sessionPin?.trim().toUpperCase() ?? '';

      if (
        previousContext.userId === nextContext.userId &&
        previousNormalizedPin === nextNormalizedPin
      ) {
        return previousContext;
      }

      return nextContext;
    });
  }, []);

  useEffect(() => {
    const normalizedSessionPin = currentHostOwnershipContext.sessionPin?.trim().toUpperCase() ?? '';

    if (currentHostOwnershipContext.userId === null || !normalizedSessionPin) {
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
  }, [currentHostOwnershipContext, getActiveHostSessionByPinUseCase]);

  useEffect(() => {
    if (!state.isResultTransitionActive || state.pendingActionResult === null) {
      return;
    }

    const pendingActionResult = state.pendingActionResult;

    const timeoutId = window.setTimeout(() => {
      dispatch({
        type: GamePlayingRuntimeActionType.ACTION_RESULT_TRANSITION_COMPLETED,
        payload: pendingActionResult,
      });
    }, RESULT_TRANSITION_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [state.isResultTransitionActive, state.pendingActionResult]);

  useEffect(() => {
    if (
      state.timeLeft === null ||
      state.timeLeft <= 0 ||
      state.isPaused ||
      state.currentStage === null ||
      state.actionResult !== null
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      dispatch({ type: GamePlayingRuntimeActionType.TIMER_TICKED });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [state.actionResult, state.currentStage, state.isPaused, state.timeLeft]);

  const resetSession = useCallback(() => {
    dispatch({ type: GamePlayingRuntimeActionType.SESSION_RESET });
  }, []);

  const handlePlayerJoined = useCallback(
    (
      payload: GameSessionPlayingRuntimeEventMap[GameSessionPlayingRuntimeEventName.PLAYER_JOINED],
    ) => {
      dispatch({ type: GamePlayingRuntimeActionType.PLAYER_JOINED, payload });
    },
    [],
  );

  const handleGameStarted = useCallback(
    (
      payload: GameSessionPlayingRuntimeEventMap[GameSessionPlayingRuntimeEventName.GAME_STARTED],
    ) => {
      dispatch({ type: GamePlayingRuntimeActionType.GAME_STARTED, payload });
    },
    [],
  );

  const handleNextStage = useCallback(
    (payload: GameSessionPlayingRuntimeEventMap[GameSessionPlayingRuntimeEventName.NEXT_STAGE]) => {
      dispatch({ type: GamePlayingRuntimeActionType.NEXT_STAGE, payload });
    },
    [],
  );

  const handleReturnedToLobby = useCallback(() => {
    dispatch({ type: GamePlayingRuntimeActionType.RETURNED_TO_LOBBY });
  }, []);

  const handleGamePaused = useCallback(
    (
      payload: GameSessionPlayingRuntimeEventMap[GameSessionPlayingRuntimeEventName.GAME_PAUSED],
    ) => {
      dispatch({ type: GamePlayingRuntimeActionType.GAME_PAUSED, payload });
    },
    [],
  );

  const handleGameResumed = useCallback(
    (
      payload: GameSessionPlayingRuntimeEventMap[GameSessionPlayingRuntimeEventName.GAME_RESUMED],
    ) => {
      dispatch({ type: GamePlayingRuntimeActionType.GAME_RESUMED, payload });
    },
    [],
  );

  const handleGameEnded = useCallback(
    (payload: GameSessionPlayingRuntimeEventMap[GameSessionPlayingRuntimeEventName.GAME_ENDED]) => {
      dispatch({ type: GamePlayingRuntimeActionType.GAME_ENDED, payload });
    },
    [],
  );

  const handleActionAcknowledged = useCallback(() => {
    dispatch({ type: GamePlayingRuntimeActionType.ACTION_ACKNOWLEDGED });
  }, []);

  const handleActionResult = useCallback(
    (
      payload: GameSessionPlayingRuntimeEventMap[GameSessionPlayingRuntimeEventName.ACTION_RESULT],
    ) => {
      dispatch({ type: GamePlayingRuntimeActionType.ACTION_RESULT, payload });
    },
    [],
  );

  const handleError = useCallback((errorCode: GamePlayingErrorCode) => {
    dispatch({ type: GamePlayingRuntimeActionType.ERROR, errorCode });
  }, []);

  const selectAction = useCallback((actionId: SubmitGameActionCommand['actionId']) => {
    dispatch({ type: GamePlayingRuntimeActionType.ACTION_SELECTED, actionId });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: GamePlayingRuntimeActionType.CLEAR_ERROR });
  }, []);

  return {
    ...state,
    isHost,
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
    syncHostOwnershipContext,
  };
}
