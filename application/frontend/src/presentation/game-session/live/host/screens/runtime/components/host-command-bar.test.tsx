import { fireEvent, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HostCommandBarStateFacade } from '../../../../../../../application/game-session/live/host/facades/host-command-bar-state.facade';
import { renderWithProviders } from '../../../../../../../test-utils/render-with-providers';
import { HostCommandBar } from './host-command-bar';

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../../../../shared/contexts/game-playing-context', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../../shared/contexts/game-playing-context')>();

  return {
    ...actual,
    useGamePlaying: () => testState.playing,
  };
});

const testState = vi.hoisted(() => ({
  rewindStage: vi.fn(),
  restartStage: vi.fn(),
  pauseGame: vi.fn(),
  resumeGame: vi.fn(),
  requestEndGame: vi.fn(),
  confirmEndGame: vi.fn(),
  cancelEndGame: vi.fn(),
  playing: {
    currentStage: { id: 42, position: 2 },
    sessionPin: 'AB12CD',
    totalStages: 5,
  },
  hostControl: {
    isHost: true,
    isPaused: false,
    canRewindStage: true,
    canReturnToLobby: true,
    shouldReturnToLobbyFromCurrentStage: false,
    isEndConfirmPending: false,
    restartStage: vi.fn(),
    rewindStage: vi.fn(),
    returnToLobby: vi.fn(),
    nextStage: vi.fn(),
    pauseGame: vi.fn(),
    resumeGame: vi.fn(),
    requestEndGame: vi.fn(),
    confirmEndGame: vi.fn(),
    cancelEndGame: vi.fn(),
  },
}));

vi.mock('../../../contexts/game-host-control-context', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../../contexts/game-host-control-context')>();

  return {
    ...actual,
    useGameHostControl: () => testState.hostControl,
  };
});

describe('HostCommandBar', () => {
  const hostCommandBarStateFacade = new HostCommandBarStateFacade();

  beforeEach(() => {
    testState.playing.currentStage = { id: 42, position: 2 };
    testState.playing.sessionPin = 'AB12CD';
    testState.playing.totalStages = 5;
    testState.hostControl.isHost = true;
    testState.hostControl.isPaused = false;
    testState.hostControl.canRewindStage = true;
    testState.hostControl.canReturnToLobby = true;
    testState.hostControl.shouldReturnToLobbyFromCurrentStage = false;
    testState.hostControl.isEndConfirmPending = false;
    testState.hostControl.restartStage = vi.fn();
    testState.hostControl.rewindStage = vi.fn();
    testState.hostControl.returnToLobby = vi.fn();
    testState.hostControl.nextStage = vi.fn();
    testState.hostControl.pauseGame = vi.fn();
    testState.hostControl.resumeGame = vi.fn();
    testState.hostControl.requestEndGame = vi.fn();
    testState.hostControl.confirmEndGame = vi.fn();
    testState.hostControl.cancelEndGame = vi.fn();
  });

  it('shows a previous-stage action on live stage routes', () => {
    renderWithProviders(<HostCommandBar hostCommandBarStateFacade={hostCommandBarStateFacade} />, {
      initialPath: '/game/AB12CD/stage/2',
    });

    const previousStageButton = screen.getByRole('button', {
      name: 'game.hostBar.previousStageCta',
    });

    fireEvent.click(previousStageButton);

    expect(testState.hostControl.rewindStage).toHaveBeenCalledTimes(1);
  });

  it('shows a single context label instead of stacked redundant headings', () => {
    renderWithProviders(<HostCommandBar hostCommandBarStateFacade={hostCommandBarStateFacade} />, {
      initialPath: '/game/AB12CD/stage/2',
    });

    expect(screen.getByText('game.hostBar.liveStatus')).toBeInTheDocument();
    expect(screen.queryByText('game.hostBar.lobbyStatus')).not.toBeInTheDocument();
  });

  it('uses the game controls label on non-stage routes', () => {
    renderWithProviders(<HostCommandBar hostCommandBarStateFacade={hostCommandBarStateFacade} />, {
      initialPath: '/game/AB12CD/lobby',
    });

    expect(screen.getByText('game.hostBar.lobbyStatus')).toBeInTheDocument();
  });

  it('disables the previous-stage action when rewinding is unavailable', () => {
    testState.hostControl.canRewindStage = false;

    renderWithProviders(<HostCommandBar hostCommandBarStateFacade={hostCommandBarStateFacade} />, {
      initialPath: '/game/AB12CD/stage/1',
    });

    expect(screen.getByRole('button', { name: 'game.hostBar.previousStageCta' })).toBeDisabled();
  });

  it('shows a direct return-to-lobby action instead of previous stage on the first stage', () => {
    testState.hostControl.shouldReturnToLobbyFromCurrentStage = true;

    renderWithProviders(<HostCommandBar hostCommandBarStateFacade={hostCommandBarStateFacade} />, {
      initialPath: '/game/AB12CD/stage/3',
    });

    fireEvent.click(screen.getByRole('button', { name: 'game.hostBar.returnToLobbyCta' }));

    expect(testState.hostControl.returnToLobby).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', { name: 'game.hostBar.previousStageCta' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('game.hostBar.previousStageHint')).not.toBeInTheDocument();
  });

  it('does not render a next-stage action on live stage routes', () => {
    renderWithProviders(<HostCommandBar hostCommandBarStateFacade={hostCommandBarStateFacade} />, {
      initialPath: '/game/AB12CD/stage/3',
    });

    expect(
      screen.queryByRole('button', { name: 'game.hostBar.nextStageCta' }),
    ).not.toBeInTheDocument();
  });

  it('restarts the current stage from the stage result route with the back-to-stage button', () => {
    renderWithProviders(<HostCommandBar hostCommandBarStateFacade={hostCommandBarStateFacade} />, {
      initialPath: '/game/AB12CD/stage/42/result',
    });

    fireEvent.click(screen.getByRole('button', { name: 'game.hostBar.backToStageCta' }));

    expect(testState.hostControl.restartStage).toHaveBeenCalledTimes(1);
    expect(testState.hostControl.rewindStage).not.toHaveBeenCalled();
    expect(screen.queryByText('game.hostBar.previousStageHint')).not.toBeInTheDocument();
  });

  it('keeps the previous button on the first-stage result route instead of switching to return to lobby', () => {
    testState.hostControl.shouldReturnToLobbyFromCurrentStage = true;

    renderWithProviders(<HostCommandBar hostCommandBarStateFacade={hostCommandBarStateFacade} />, {
      initialPath: '/game/AB12CD/stage/1/result',
    });

    fireEvent.click(screen.getByRole('button', { name: 'game.hostBar.backToStageCta' }));

    expect(testState.hostControl.restartStage).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByRole('button', { name: 'game.hostBar.returnToLobbyCta' }),
    ).not.toBeInTheDocument();
  });

  it('shows a final leaderboard action on the last result route', () => {
    testState.playing.currentStage = { id: 42, position: 4 };

    renderWithProviders(<HostCommandBar hostCommandBarStateFacade={hostCommandBarStateFacade} />, {
      initialPath: '/game/AB12CD/stage/42/result',
    });

    expect(
      screen.queryByRole('button', { name: 'game.hostBar.nextStageCta' }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'game.hostBar.finalLeaderboardCta' }));

    expect(testState.hostControl.nextStage).toHaveBeenCalledTimes(1);
  });
});
