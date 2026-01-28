import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameStageScreenRoutingService } from '../../../../../../domains/game-session/services/game-stage-screen-routing.service';
import { renderWithProviders } from '../../../../../../test-utils/render-with-providers';
import { StageScreen } from './stage-screen';

const stageHeaderProps = vi.hoisted(() => ({
  last: null as null | Record<string, unknown>,
}));

const stageState = vi.hoisted(() => ({
  resolve: vi.fn(),
  useStageScreenState: {
    normalizedSessionPin: 'AB12CD',
    hasRestoredSession: true,
    hasIdentity: true,
    hasGameEnded: false,
    hasStageWaitTimedOut: false,
    currentGameType: 'quiz',
    currentStage: {
      id: 1,
      sourceId: 10,
      position: 0,
      text: 'Choose one',
      type: 'multiple',
      actions: [],
      timeLimit: 20,
      points: 100,
    },
    actionResult: null as null | { isCorrect: boolean; points: number; correctActionIds: number[] },
    actionSubmitted: false,
    errorCode: null,
    isPaused: false,
    isResultTransitionActive: false,
    isHost: true,
    resolvedActions: [],
    resultDistribution: [],
    stagePosition: 1,
    timeLeft: 20,
    totalStages: 3,
    submitAction: vi.fn(),
    navigate: vi.fn(),
  },
}));

vi.mock('src/presentation/shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/factories/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal, {
    params: { sessionPin: 'AB12CD', stageId: '1' },
  });
});

vi.mock('../../contexts/game-type-live-registry-context', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../contexts/game-type-live-registry-context')>();

  return {
    ...actual,
    useGameTypeLiveRegistry: () => ({
      resolve: stageState.resolve,
    }),
  };
});

vi.mock('../../contexts/game-playing-context', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../contexts/game-playing-context')>();

  return {
    ...actual,
    useGamePlaying: () => ({
      activePlayerCount: 2,
      gameTitle: 'Arcade Trivia',
      gameType: 'quiz',
    }),
  };
});

vi.mock('./use-stage-screen-state', () => ({
  useStageScreenState: () => stageState.useStageScreenState,
}));

vi.mock('./components/stage-header-bar', () => ({
  StageHeaderBar: (props: Record<string, unknown>) => {
    stageHeaderProps.last = props;
    return <div>stage-header</div>;
  },
}));

describe('StageScreen', () => {
  const stageScreenRoutingService = new GameStageScreenRoutingService();

  beforeEach(() => {
    stageState.resolve.mockReset();
    stageState.resolve.mockReturnValue({
      titleKey: 'quiz.gameType.title',
      renderHostStageView: () => <div>host-stage-view</div>,
      renderHostResultView: () => <div>host-result-view</div>,
      renderPlayerStageView: () => <div>player-stage-view</div>,
      renderPlayerResultView: () => <div>player-result-view</div>,
    });
    stageState.useStageScreenState.actionResult = null;
    stageState.useStageScreenState.isResultTransitionActive = false;
  });

  it('resolves the live facade from the current game type instead of the stage type', () => {
    renderWithProviders(<StageScreen stageScreenRoutingService={stageScreenRoutingService} />);

    expect(stageState.resolve).toHaveBeenCalledWith('quiz');
    expect(screen.getByText('host-stage-view')).toBeInTheDocument();
  });

  it('keeps hosts on the stage options view when a result exists but the route is the stage view', () => {
    stageState.useStageScreenState.actionResult = {
      isCorrect: true,
      points: 100,
      correctActionIds: [1],
    };

    renderWithProviders(<StageScreen stageScreenRoutingService={stageScreenRoutingService} />, {
      initialPath: '/game/AB12CD/stage/1',
    });

    expect(screen.getByText('host-stage-view')).toBeInTheDocument();
    expect(screen.queryByText('host-result-view')).not.toBeInTheDocument();
  });

  it('renders the host result view on the dedicated result route', () => {
    stageState.useStageScreenState.actionResult = {
      isCorrect: true,
      points: 100,
      correctActionIds: [1],
    };

    renderWithProviders(<StageScreen stageScreenRoutingService={stageScreenRoutingService} />, {
      initialPath: '/game/AB12CD/stage/1/result',
    });

    expect(screen.getByText('host-result-view')).toBeInTheDocument();
    expect(screen.queryByText('host-stage-view')).not.toBeInTheDocument();
  });

  it('passes the active player count to the stage header', () => {
    renderWithProviders(<StageScreen stageScreenRoutingService={stageScreenRoutingService} />);

    expect(stageHeaderProps.last).toMatchObject({
      activePlayerCount: 2,
      gameTypeTitleKey: 'quiz.gameType.title',
      gameTitle: 'Arcade Trivia',
      sessionPin: 'AB12CD',
      stagePosition: 1,
      totalStages: 3,
    });
  });

  it('renders a timer-finished transition overlay while staying on the live stage view', () => {
    stageState.useStageScreenState.isResultTransitionActive = true;

    renderWithProviders(<StageScreen stageScreenRoutingService={stageScreenRoutingService} />, {
      initialPath: '/game/AB12CD/stage/1',
    });

    expect(screen.getByTestId('stage-result-transition')).toBeInTheDocument();
    expect(screen.getByText('host-stage-view')).toBeInTheDocument();
  });
});
