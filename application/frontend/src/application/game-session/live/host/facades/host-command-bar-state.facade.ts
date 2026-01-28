import { injectable } from 'inversify';

interface HostCommandBarStateHandlers {
  readonly restartStage: () => void;
  readonly rewindStage: () => void;
  readonly returnToLobby: () => void;
  readonly nextStage: () => void;
}

interface ResolveHostCommandBarStateInput {
  readonly pathname: string;
  readonly hasCurrentStage: boolean;
  readonly hasSessionPin: boolean;
  readonly hasMoreStages: boolean;
  readonly canRewindStage: boolean;
  readonly canReturnToLobby: boolean;
  readonly shouldReturnToLobbyFromCurrentStage: boolean;
}

interface HostCommandBarState {
  readonly isLiveScreen: boolean;
  readonly isResultScreen: boolean;
  readonly statusLabelKey: string;
  readonly canRestartStage: boolean;
  readonly showReturnToLobbyAction: boolean;
  readonly backActionEnabled: boolean;
  readonly backActionLabelKey: string;
  readonly backActionHandler: () => void;
  readonly nextStageEnabled: boolean;
  readonly nextStageLabelKey: string;
  readonly nextStageHandler: () => void;
  readonly showPreviousStageHint: boolean;
}

@injectable()
export class HostCommandBarStateFacade {
  resolve(
    input: ResolveHostCommandBarStateInput,
    handlers: HostCommandBarStateHandlers,
  ): HostCommandBarState {
    const isLiveScreen = input.pathname.includes('/stage/');
    const isResultScreen = input.pathname.includes('/result');
    const statusLabelKey = isLiveScreen ? 'game.hostBar.liveStatus' : 'game.hostBar.lobbyStatus';
    const canRestartStage = isResultScreen && input.hasSessionPin && input.hasCurrentStage;
    const showReturnToLobbyAction =
      isLiveScreen && !isResultScreen && input.shouldReturnToLobbyFromCurrentStage;
    const backActionEnabled = canRestartStage
      ? true
      : showReturnToLobbyAction
        ? input.canReturnToLobby
        : input.canRewindStage;
    const backActionLabelKey = canRestartStage
      ? 'game.hostBar.backToStageCta'
      : showReturnToLobbyAction
        ? 'game.hostBar.returnToLobbyCta'
        : 'game.hostBar.previousStageCta';
    const backActionHandler = canRestartStage
      ? handlers.restartStage
      : showReturnToLobbyAction
        ? handlers.returnToLobby
        : handlers.rewindStage;

    const nextStageEnabled = isResultScreen && input.hasSessionPin && input.hasCurrentStage;
    const nextStageLabelKey = input.hasMoreStages
      ? 'game.hostBar.nextStageCta'
      : 'game.hostBar.finalLeaderboardCta';

    return {
      isLiveScreen,
      isResultScreen,
      statusLabelKey,
      canRestartStage,
      showReturnToLobbyAction,
      backActionEnabled,
      backActionLabelKey,
      backActionHandler,
      nextStageEnabled,
      nextStageLabelKey,
      nextStageHandler: handlers.nextStage,
      showPreviousStageHint: !showReturnToLobbyAction && !isResultScreen,
    };
  }
}
