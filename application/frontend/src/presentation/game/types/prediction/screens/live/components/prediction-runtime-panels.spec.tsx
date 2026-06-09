import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { PartyRuntimePhase } from '../../../../../../../domains/game/party/shared/entities/party-runtime-context';
import { PartyStatus } from '../../../../../../../domains/game/party/shared/entities/party-status';
import { GameType } from '../../../../../../../domains/game/types/shared/game-type';
import { PartyActionIdentifierMockFactory } from '../../../../../../../test-utils/mocks/party-action-identifier-mock-factory';
import { PartyIdentifierMockFactory } from '../../../../../../../test-utils/mocks/party-identifier-mock-factory';
import { PartyPinIdentifierMockFactory } from '../../../../../../../test-utils/mocks/party-pin-identifier-mock-factory';
import { StageIdentifierMockFactory } from '../../../../../../../test-utils/mocks/stage-identifier-mock-factory';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { KeyboardShortcutsProvider } from '../../../../../../shared/keyboard';
import { PredictionHostStagePanel } from './prediction-host-stage-panel';
import { PredictionPlayerResultSurface } from './prediction-player-result-surface';
import { PredictionPlayerStageSurface } from './prediction-player-stage-surface';

vi.mock('../../../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;

  return {
    ...actual,
    usePresentationTranslation: () => ({
      t: (key: string, options?: Record<string, unknown>) =>
        options
          ? `${key}:${Object.entries(options)
              .map(([optionKey, optionValue]) => `${optionKey}=${String(optionValue)}`)
              .join(',')}`
          : key,
    }),
  };
});

const partyActionIdentifier = new PartyActionIdentifierMockFactory().create();
const partyIdentifier = new PartyIdentifierMockFactory().create();
const partyPinIdentifier = new PartyPinIdentifierMockFactory().create();
const stageIdentifier = new StageIdentifierMockFactory().create();

const firstActionId = partyActionIdentifier.parse(101);
const secondActionId = partyActionIdentifier.parse(102);
const stageId = stageIdentifier.parse(10);

function stubMatchMedia(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  }));
}

function createPredictionParty(context: PartyObservation['context']): PartyObservation {
  return {
    context,
    gameType: GameType.Prediction,
    host: {
      avatarUri: null,
      username: 'Host',
    },
    isObserverHost: false,
    partyId: partyIdentifier.parse(1),
    pin: partyPinIdentifier.parse('AB12CD'),
    players: [],
    status: PartyStatus.ACTIVE,
  };
}

function createStageParty(): PartyObservation {
  return createPredictionParty({
    lifecycle: {
      phase: PartyRuntimePhase.STAGE,
      stageEndsAtEpochMs: 11_000,
      stageId,
      stagePosition: 0,
      stageRemainingDurationMs: 10_000,
      stageTimeLimitSeconds: 10,
      totalStages: 2,
    },
    stage: {
      actionSubmission: {
        currentPlayer: null,
        submittedPlayerCount: 1,
        totalEligiblePlayerCount: 3,
      },
      current: {
        actions: [
          { id: firstActionId, text: 'Home wins' },
          { id: secondActionId, text: 'Away wins' },
        ],
        text: 'Who wins the final?',
      },
    },
  });
}

function createResultParty(): PartyObservation {
  return createPredictionParty({
    lifecycle: {
      phase: PartyRuntimePhase.RESULT,
      stageEndsAtEpochMs: null,
      stageId,
      stagePosition: 0,
      stageRemainingDurationMs: null,
      stageTimeLimitSeconds: null,
      totalStages: 2,
    },
    result: {
      current: {
        actions: [
          {
            actionCount: 2,
            actionPercent: 67,
            earnedPoints: 0,
            id: firstActionId,
            isCorrect: false,
            text: 'Home wins',
          },
          {
            actionCount: 1,
            actionPercent: 33,
            earnedPoints: 250,
            id: secondActionId,
            isCorrect: true,
            text: 'Away wins',
          },
        ],
        text: 'Who wins the final?',
      },
      currentPlayer: {
        earnedPoints: 250,
        isCorrect: true,
        selectedActionId: secondActionId,
      },
    },
  });
}

function renderPredictionPlayerStageSurface(
  overrides: Partial<React.ComponentProps<typeof PredictionPlayerStageSurface>> = {},
) {
  return renderWithUiProvider(
    <KeyboardShortcutsProvider>
      <PredictionPlayerStageSurface
        onLeaveParty={vi.fn()}
        onSubmitAction={vi.fn()}
        party={createStageParty()}
        pendingActionId={null}
        playerActionErrorMessage={null}
        {...overrides}
      />
    </KeyboardShortcutsProvider>,
  );
}

describe('prediction runtime panels', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders the host prediction stage from party state', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);

    renderWithUiProvider(<PredictionHostStagePanel party={createStageParty()} />);

    expect(screen.getByTestId('prediction-host-stage-panel')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Who wins the final?' })).toBeInTheDocument();
    expect(screen.getByText('Home wins')).toBeInTheDocument();
    expect(screen.getByText('Away wins')).toBeInTheDocument();
    expect(screen.getByText('game.party.route.runtimeTimeLeft:time=00:10')).toBeInTheDocument();
    expect(
      screen.getByText(
        'game.party.route.runtimeResponsesReceived:submitted=1,total=3. game.party.route.runtimeResponsesPending:remaining=2',
      ),
    ).toBeInTheDocument();
  });

  it('submits the selected prediction action from the player stage', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);

    const onSubmitAction = vi.fn();

    renderPredictionPlayerStageSurface({ onSubmitAction });

    act(() => {
      vi.advanceTimersByTime(3_000);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Away wins' }));

    expect(onSubmitAction).toHaveBeenCalledWith(secondActionId);
  });

  it('submits immediately on mobile without waiting for a reveal lock', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    stubMatchMedia(true);

    const onSubmitAction = vi.fn();

    renderPredictionPlayerStageSurface({ onSubmitAction });

    fireEvent.click(screen.getByRole('button', { name: 'Away wins' }));

    expect(onSubmitAction).toHaveBeenCalledWith(secondActionId);
  });

  it('submits the selected prediction action from the keyboard shortcut', () => {
    vi.useFakeTimers();
    vi.setSystemTime(1_000);

    const onSubmitAction = vi.fn();

    renderPredictionPlayerStageSurface({ onSubmitAction });

    act(() => {
      vi.advanceTimersByTime(3_000);
    });

    fireEvent.keyDown(document, { key: '2' });

    expect(onSubmitAction).toHaveBeenCalledWith(secondActionId);
    expect(screen.getByRole('button', { name: 'Away wins' })).toHaveAttribute(
      'aria-keyshortcuts',
      '2',
    );
  });

  it('disables prediction actions when the stage timer has expired', () => {
    vi.useFakeTimers();
    vi.setSystemTime(11_000);

    const onSubmitAction = vi.fn();

    renderPredictionPlayerStageSurface({ onSubmitAction });

    const actionButton = screen.getByRole('button', { name: 'Away wins' });

    expect(screen.getAllByText('game.party.route.runtimeTimeUp')).toHaveLength(2);
    expect(actionButton).toBeDisabled();

    fireEvent.click(actionButton);

    expect(onSubmitAction).not.toHaveBeenCalled();
  });

  it('renders the player prediction result reveal from party state', () => {
    renderWithUiProvider(
      <PredictionPlayerResultSurface onLeaveParty={vi.fn()} party={createResultParty()} />,
    );

    expect(screen.getByTestId('prediction-player-result-surface')).toBeInTheDocument();
    expect(screen.getByText('game.types.prediction.runtime.resultCorrect')).toBeInTheDocument();
    expect(
      screen.getByText('game.types.prediction.runtime.pointsAwarded:points=250'),
    ).toBeInTheDocument();
    expect(screen.getByText('game.types.prediction.runtime.correctBadge')).toBeInTheDocument();
    expect(screen.getByText('game.types.prediction.runtime.yourPickBadge')).toBeInTheDocument();
  });
});
