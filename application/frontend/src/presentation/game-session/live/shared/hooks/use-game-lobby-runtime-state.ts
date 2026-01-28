import { useCallback, useReducer } from 'react';
import { GameLobbyErrorCode } from '../../../../../domains/game-session/errors/game-lobby-error-code';
import type { GameLobbyContextValue } from '../contexts/game-lobby-context';

interface GameLobbyRuntimeState {
  readonly gameType: GameLobbyContextValue['gameType'];
  readonly gameTitle: GameLobbyContextValue['gameTitle'];
  readonly players: GameLobbyContextValue['players'];
  readonly hasReceivedRoster: boolean;
  readonly hasGameStarted: boolean;
  readonly errorCode: GameLobbyErrorCode | null;
}

enum GameLobbyRuntimeActionType {
  SESSION_RESET = 'session-reset',
  PLAYER_JOINED = 'player-joined',
  GAME_STARTED = 'game-started',
  GAME_RESUMED = 'game-resumed',
  RETURNED_TO_LOBBY = 'returned-to-lobby',
  ERROR = 'error',
  CLEAR_ERROR = 'clear-error',
}

type GameLobbyRuntimeAction =
  | { readonly type: GameLobbyRuntimeActionType.SESSION_RESET }
  | {
      readonly type: GameLobbyRuntimeActionType.PLAYER_JOINED;
      readonly gameType: GameLobbyContextValue['gameType'];
      readonly gameTitle: GameLobbyContextValue['gameTitle'];
      readonly players: GameLobbyContextValue['players'];
    }
  | {
      readonly type: GameLobbyRuntimeActionType.GAME_STARTED;
      readonly gameType: GameLobbyContextValue['gameType'];
      readonly gameTitle: GameLobbyContextValue['gameTitle'];
    }
  | {
      readonly type: GameLobbyRuntimeActionType.GAME_RESUMED;
      readonly gameType: GameLobbyContextValue['gameType'];
      readonly gameTitle: GameLobbyContextValue['gameTitle'];
    }
  | {
      readonly type: GameLobbyRuntimeActionType.RETURNED_TO_LOBBY;
      readonly gameType: GameLobbyContextValue['gameType'];
      readonly gameTitle: GameLobbyContextValue['gameTitle'];
      readonly players: GameLobbyContextValue['players'];
    }
  | {
      readonly type: GameLobbyRuntimeActionType.ERROR;
      readonly errorCode: GameLobbyErrorCode;
    }
  | { readonly type: GameLobbyRuntimeActionType.CLEAR_ERROR };

const initialGameLobbyRuntimeState: GameLobbyRuntimeState = {
  gameType: null,
  gameTitle: null,
  players: [],
  hasReceivedRoster: false,
  hasGameStarted: false,
  errorCode: null,
};

function gameLobbyRuntimeReducer(
  state: GameLobbyRuntimeState,
  action: GameLobbyRuntimeAction,
): GameLobbyRuntimeState {
  switch (action.type) {
    case GameLobbyRuntimeActionType.SESSION_RESET:
      return initialGameLobbyRuntimeState;
    case GameLobbyRuntimeActionType.PLAYER_JOINED:
      return {
        ...state,
        gameType: action.gameType,
        gameTitle: action.gameTitle,
        players: action.players,
        hasReceivedRoster: true,
        errorCode: null,
      };
    case GameLobbyRuntimeActionType.GAME_STARTED:
      return {
        ...state,
        gameType: action.gameType,
        gameTitle: action.gameTitle,
        hasGameStarted: true,
      };
    case GameLobbyRuntimeActionType.GAME_RESUMED:
      return {
        ...state,
        gameType: action.gameType,
        gameTitle: action.gameTitle,
        hasGameStarted: true,
      };
    case GameLobbyRuntimeActionType.RETURNED_TO_LOBBY:
      return {
        ...state,
        gameType: action.gameType,
        gameTitle: action.gameTitle,
        players: action.players,
        hasReceivedRoster: true,
        hasGameStarted: false,
        errorCode: null,
      };
    case GameLobbyRuntimeActionType.ERROR:
      return {
        ...state,
        errorCode: action.errorCode,
      };
    case GameLobbyRuntimeActionType.CLEAR_ERROR:
      return {
        ...state,
        errorCode: null,
      };
  }
}

export function useGameLobbyRuntimeState() {
  const [state, dispatch] = useReducer(gameLobbyRuntimeReducer, initialGameLobbyRuntimeState);

  const resetSession = useCallback(() => {
    dispatch({ type: GameLobbyRuntimeActionType.SESSION_RESET });
  }, []);

  const handlePlayerJoined = useCallback(
    (
      players: GameLobbyContextValue['players'],
      gameTitle: GameLobbyContextValue['gameTitle'],
      gameType: GameLobbyContextValue['gameType'],
    ) => {
      dispatch({ type: GameLobbyRuntimeActionType.PLAYER_JOINED, gameTitle, gameType, players });
    },
    [],
  );

  const handleGameStarted = useCallback(
    (
      gameTitle: GameLobbyContextValue['gameTitle'],
      gameType: GameLobbyContextValue['gameType'],
    ) => {
      dispatch({ type: GameLobbyRuntimeActionType.GAME_STARTED, gameTitle, gameType });
    },
    [],
  );

  const handleGameResumed = useCallback(
    (
      gameTitle: GameLobbyContextValue['gameTitle'],
      gameType: GameLobbyContextValue['gameType'],
    ) => {
      dispatch({ type: GameLobbyRuntimeActionType.GAME_RESUMED, gameTitle, gameType });
    },
    [],
  );

  const handleReturnedToLobby = useCallback(
    (
      players: GameLobbyContextValue['players'],
      gameTitle: GameLobbyContextValue['gameTitle'],
      gameType: GameLobbyContextValue['gameType'],
    ) => {
      dispatch({
        type: GameLobbyRuntimeActionType.RETURNED_TO_LOBBY,
        players,
        gameTitle,
        gameType,
      });
    },
    [],
  );

  const handleError = useCallback((errorCode: GameLobbyErrorCode) => {
    dispatch({ type: GameLobbyRuntimeActionType.ERROR, errorCode });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: GameLobbyRuntimeActionType.CLEAR_ERROR });
  }, []);

  return {
    ...state,
    resetSession,
    handlePlayerJoined,
    handleGameStarted,
    handleGameResumed,
    handleReturnedToLobby,
    handleError,
    clearError,
  };
}
