import { type MutableRefObject, useCallback, useRef } from 'react';
import { type User } from '../../../../../domains/auth/entities/user';
import {
  type JoinGameRequestReceipt,
  useGameJoin,
} from '../../../../../presentation/game-session/live/shared/contexts/game-join-context';
import { useAuth } from '../../../../../presentation/identity/contexts/auth-context';
import { AppGameSessionRejoinRuntime } from '../runtimes/app-game-session-rejoin-runtime';

interface UseGameSessionReplayOptions {
  readonly gameSessionRejoinService: AppGameSessionRejoinRuntime;
  readonly observeSession?: (normalizedPin: string) => void;
}

interface UseGameSessionReplayResult {
  readonly lastObservedSessionPinRef: MutableRefObject<string | null>;
  readonly replaySession: (normalizedPin: string) => void;
  readonly resetReplayState: () => void;
}

interface ReplayAttempt {
  readonly pin: string;
  readonly hasRestoredSession: boolean;
  readonly lastJoinRequest: JoinGameRequestReceipt | null;
  readonly isAuthenticated: boolean;
  readonly user: User | null;
  readonly lastDispatchKey: string | null;
}

export function useGameSessionReplay({
  gameSessionRejoinService,
  observeSession,
}: UseGameSessionReplayOptions): UseGameSessionReplayResult {
  const { hasRestoredSession, isAuthenticated, user } = useAuth();
  const { lastJoinRequest } = useGameJoin();
  const lastJoinDispatchRef = useRef<string | null>(null);
  const lastObservedSessionPinRef = useRef<string | null>(null);

  const replaySession = useCallback(
    (normalizedPin: string) => {
      const replayAttempt: ReplayAttempt = {
        pin: normalizedPin,
        hasRestoredSession,
        lastJoinRequest,
        isAuthenticated,
        user,
        lastDispatchKey: lastJoinDispatchRef.current,
      };
      const nextDispatchKey = gameSessionRejoinService.replayForSession(replayAttempt);

      if (nextDispatchKey) {
        lastJoinDispatchRef.current = nextDispatchKey;
        lastObservedSessionPinRef.current = null;
        return;
      }

      if (
        isAuthenticated &&
        observeSession &&
        lastObservedSessionPinRef.current !== normalizedPin
      ) {
        observeSession(normalizedPin);
        lastObservedSessionPinRef.current = normalizedPin;
      }
    },
    [
      gameSessionRejoinService,
      hasRestoredSession,
      isAuthenticated,
      lastJoinRequest,
      observeSession,
      user,
    ],
  );

  const resetReplayState = useCallback(() => {
    lastJoinDispatchRef.current = null;
    lastObservedSessionPinRef.current = null;
  }, []);

  return {
    lastObservedSessionPinRef,
    replaySession,
    resetReplayState,
  };
}
