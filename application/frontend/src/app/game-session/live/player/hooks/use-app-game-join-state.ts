import { useCallback, useReducer } from 'react';
import { GameJoinErrorCode } from '../../../../../domains/game-session/errors/game-join-error-code';
import type {
  GameJoinContextValue,
  JoinGameRequestReceipt,
} from '../../../../../presentation/game-session/live/shared/contexts/game-join-context';

interface GameJoinState {
  readonly errorCode: GameJoinErrorCode | null;
  readonly guestNickname: string;
  readonly isSubmitting: boolean;
  readonly lastJoinRequest: JoinGameRequestReceipt | null;
}

enum GameJoinActionType {
  SUBMIT_STARTED = 'submit-started',
  AUTHENTICATED_JOIN_SUCCEEDED = 'authenticated-join-succeeded',
  GUEST_JOIN_SUCCEEDED = 'guest-join-succeeded',
  SUBMIT_FAILED = 'submit-failed',
  CLEAR_ERROR = 'clear-error',
}

type GameJoinAction =
  | { readonly type: GameJoinActionType.SUBMIT_STARTED }
  | {
      readonly type: GameJoinActionType.AUTHENTICATED_JOIN_SUCCEEDED;
      readonly request: JoinGameRequestReceipt;
    }
  | {
      readonly type: GameJoinActionType.GUEST_JOIN_SUCCEEDED;
      readonly guestNickname: string;
      readonly request: JoinGameRequestReceipt;
    }
  | {
      readonly type: GameJoinActionType.SUBMIT_FAILED;
      readonly errorCode: GameJoinErrorCode;
    }
  | { readonly type: GameJoinActionType.CLEAR_ERROR };

function gameJoinReducer(state: GameJoinState, action: GameJoinAction): GameJoinState {
  switch (action.type) {
    case GameJoinActionType.SUBMIT_STARTED:
      return {
        ...state,
        isSubmitting: true,
        errorCode: null,
      };
    case GameJoinActionType.AUTHENTICATED_JOIN_SUCCEEDED:
      return {
        ...state,
        isSubmitting: false,
        errorCode: null,
        lastJoinRequest: action.request,
      };
    case GameJoinActionType.GUEST_JOIN_SUCCEEDED:
      return {
        ...state,
        isSubmitting: false,
        errorCode: null,
        guestNickname: action.guestNickname,
        lastJoinRequest: action.request,
      };
    case GameJoinActionType.SUBMIT_FAILED:
      return {
        ...state,
        isSubmitting: false,
        errorCode: action.errorCode,
      };
    case GameJoinActionType.CLEAR_ERROR:
      return {
        ...state,
        errorCode: null,
      };
  }
}

export function useAppGameJoinState(initialGuestNickname: string) {
  const [state, dispatch] = useReducer(gameJoinReducer, {
    errorCode: null,
    guestNickname: initialGuestNickname,
    isSubmitting: false,
    lastJoinRequest: null,
  } satisfies GameJoinState);

  const startSubmit = useCallback(() => {
    dispatch({ type: GameJoinActionType.SUBMIT_STARTED });
  }, []);

  const completeAuthenticatedJoin = useCallback(
    (request: GameJoinContextValue['lastJoinRequest']) => {
      if (!request) {
        return;
      }

      dispatch({
        type: GameJoinActionType.AUTHENTICATED_JOIN_SUCCEEDED,
        request,
      });
    },
    [],
  );

  const completeGuestJoin = useCallback(
    (guestNickname: string, request: GameJoinContextValue['lastJoinRequest']) => {
      if (!request) {
        return;
      }

      dispatch({
        type: GameJoinActionType.GUEST_JOIN_SUCCEEDED,
        guestNickname,
        request,
      });
    },
    [],
  );

  const failSubmit = useCallback((errorCode: GameJoinErrorCode) => {
    dispatch({ type: GameJoinActionType.SUBMIT_FAILED, errorCode });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: GameJoinActionType.CLEAR_ERROR });
  }, []);

  return {
    ...state,
    startSubmit,
    completeAuthenticatedJoin,
    completeGuestJoin,
    failSubmit,
    clearError,
  };
}
