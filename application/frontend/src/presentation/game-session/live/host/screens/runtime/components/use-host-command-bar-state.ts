import type { HostCommandBarStateFacade } from '../../../../../../../application/game-session/live/host/facades/host-command-bar-state.facade';
import type { GamePlayingContextValue } from '../../../../shared/contexts/game-playing-context';
import type { GameHostControlContextValue } from '../../../contexts/game-host-control-context';

interface UseHostCommandBarStateParams {
  readonly hostCommandBarStateFacade: HostCommandBarStateFacade;
  readonly pathname: string;
  readonly currentStage: GamePlayingContextValue['currentStage'];
  readonly sessionPin: string | null;
  readonly totalStages: number;
  readonly canRewindStage: boolean;
  readonly canReturnToLobby: boolean;
  readonly shouldReturnToLobbyFromCurrentStage: boolean;
  readonly restartStage: GameHostControlContextValue['restartStage'];
  readonly rewindStage: GameHostControlContextValue['rewindStage'];
  readonly returnToLobby: GameHostControlContextValue['returnToLobby'];
  readonly nextStage: GameHostControlContextValue['nextStage'];
}

export function useHostCommandBarState({
  hostCommandBarStateFacade,
  pathname,
  currentStage,
  sessionPin,
  totalStages,
  canRewindStage,
  canReturnToLobby,
  shouldReturnToLobbyFromCurrentStage,
  restartStage,
  rewindStage,
  returnToLobby,
  nextStage,
}: UseHostCommandBarStateParams) {
  return hostCommandBarStateFacade.resolve(
    {
      pathname,
      hasCurrentStage: currentStage !== null,
      hasSessionPin: typeof sessionPin === 'string' && sessionPin.length > 0,
      hasMoreStages: currentStage !== null && currentStage.position + 1 < totalStages,
      canRewindStage,
      canReturnToLobby,
      shouldReturnToLobbyFromCurrentStage,
    },
    {
      restartStage,
      rewindStage,
      returnToLobby,
      nextStage,
    },
  );
}
