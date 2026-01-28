import { useCallback } from 'react';
import type {
  GameSessionPlayingRuntimePort,
  SubmitGameActionCommand,
} from '../../../../../application/game-session/live/player/ports/game-session-playing-runtime.port';

interface GuestPlayerRuntimeLike {
  restore(): { readonly id: string } | null;
}

interface UseGamePlayingActionSubmissionParams {
  readonly actionSubmitted: boolean;
  readonly gamePlayingRuntime: GameSessionPlayingRuntimePort;
  readonly guestPlayerService: GuestPlayerRuntimeLike;
  readonly isAuthenticated: boolean;
  readonly selectAction: (actionId: SubmitGameActionCommand['actionId']) => void;
  readonly sessionPin: string | null;
  readonly timeLeft: number | null;
  readonly userId?: number;
}

export function useGamePlayingActionSubmission({
  actionSubmitted,
  gamePlayingRuntime,
  guestPlayerService,
  isAuthenticated,
  selectAction,
  sessionPin,
  timeLeft,
  userId,
}: UseGamePlayingActionSubmissionParams) {
  return useCallback(
    (actionId: number) => {
      if (!sessionPin || timeLeft === null || timeLeft < 0 || actionSubmitted) {
        return;
      }

      const restoredGuest = guestPlayerService.restore();
      if (!isAuthenticated && !restoredGuest) {
        return;
      }

      selectAction(actionId);

      gamePlayingRuntime.submitAction({
        pin: sessionPin,
        actionId,
        timeLeft,
        userId: isAuthenticated ? userId : undefined,
        guestId: isAuthenticated ? undefined : restoredGuest?.id,
      });
    },
    [
      actionSubmitted,
      gamePlayingRuntime,
      guestPlayerService,
      isAuthenticated,
      selectAction,
      sessionPin,
      timeLeft,
      userId,
    ],
  );
}
