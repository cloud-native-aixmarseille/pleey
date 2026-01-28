import { describe, expect, it, vi } from 'vitest';
import { HostCommandBarStateFacade } from './host-command-bar-state.facade';

describe('HostCommandBarStateFacade', () => {
  const facade = new HostCommandBarStateFacade();

  it('rewinds on live stage routes by default', () => {
    const handlers = {
      restartStage: vi.fn(),
      rewindStage: vi.fn(),
      returnToLobby: vi.fn(),
      nextStage: vi.fn(),
    };

    const state = facade.resolve(
      {
        pathname: '/game/AB12CD/stage/2',
        hasCurrentStage: true,
        hasSessionPin: true,
        hasMoreStages: true,
        canRewindStage: true,
        canReturnToLobby: true,
        shouldReturnToLobbyFromCurrentStage: false,
      },
      handlers,
    );

    expect(state.statusLabelKey).toBe('game.hostBar.liveStatus');
    expect(state.backActionLabelKey).toBe('game.hostBar.previousStageCta');
    expect(state.backActionEnabled).toBe(true);

    state.backActionHandler();

    expect(handlers.rewindStage).toHaveBeenCalledTimes(1);
  });

  it('switches to the return-to-lobby action on the first live stage', () => {
    const handlers = {
      restartStage: vi.fn(),
      rewindStage: vi.fn(),
      returnToLobby: vi.fn(),
      nextStage: vi.fn(),
    };

    const state = facade.resolve(
      {
        pathname: '/game/AB12CD/stage/1',
        hasCurrentStage: true,
        hasSessionPin: true,
        hasMoreStages: true,
        canRewindStage: false,
        canReturnToLobby: true,
        shouldReturnToLobbyFromCurrentStage: true,
      },
      handlers,
    );

    expect(state.backActionLabelKey).toBe('game.hostBar.returnToLobbyCta');
    expect(state.showPreviousStageHint).toBe(false);

    state.backActionHandler();

    expect(handlers.returnToLobby).toHaveBeenCalledTimes(1);
  });

  it('restarts the current stage from result routes', () => {
    const handlers = {
      restartStage: vi.fn(),
      rewindStage: vi.fn(),
      returnToLobby: vi.fn(),
      nextStage: vi.fn(),
    };

    const state = facade.resolve(
      {
        pathname: '/game/AB12CD/stage/42/result',
        hasCurrentStage: true,
        hasSessionPin: true,
        hasMoreStages: true,
        canRewindStage: true,
        canReturnToLobby: true,
        shouldReturnToLobbyFromCurrentStage: true,
      },
      handlers,
    );

    expect(state.backActionLabelKey).toBe('game.hostBar.backToStageCta');
    expect(state.showReturnToLobbyAction).toBe(false);

    state.backActionHandler();

    expect(handlers.restartStage).toHaveBeenCalledTimes(1);
  });

  it('enables next stage on result routes when more stages remain', () => {
    const handlers = {
      restartStage: vi.fn(),
      rewindStage: vi.fn(),
      returnToLobby: vi.fn(),
      nextStage: vi.fn(),
    };

    const state = facade.resolve(
      {
        pathname: '/game/AB12CD/stage/2/result',
        hasCurrentStage: true,
        hasSessionPin: true,
        hasMoreStages: true,
        canRewindStage: true,
        canReturnToLobby: true,
        shouldReturnToLobbyFromCurrentStage: false,
      },
      handlers,
    );

    expect(state.nextStageEnabled).toBe(true);
    expect(state.nextStageLabelKey).toBe('game.hostBar.nextStageCta');

    state.nextStageHandler();

    expect(handlers.nextStage).toHaveBeenCalledTimes(1);
  });

  it('shows the final leaderboard action on result routes when no more stages remain', () => {
    const handlers = {
      restartStage: vi.fn(),
      rewindStage: vi.fn(),
      returnToLobby: vi.fn(),
      nextStage: vi.fn(),
    };

    const state = facade.resolve(
      {
        pathname: '/game/AB12CD/stage/5/result',
        hasCurrentStage: true,
        hasSessionPin: true,
        hasMoreStages: false,
        canRewindStage: true,
        canReturnToLobby: true,
        shouldReturnToLobbyFromCurrentStage: false,
      },
      handlers,
    );

    expect(state.nextStageEnabled).toBe(true);
    expect(state.nextStageLabelKey).toBe('game.hostBar.finalLeaderboardCta');

    state.nextStageHandler();

    expect(handlers.nextStage).toHaveBeenCalledTimes(1);
  });
});
