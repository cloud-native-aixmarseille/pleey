import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { PARTY_RUNTIME_PHASE } from '../../../../../../../domains/game/party/shared/entities/party-runtime-context';
import { PartyStatus } from '../../../../../../../domains/game/party/shared/entities/party-status';
import { GameType } from '../../../../../../../domains/game/types/shared/game-type';
import { PartyActionIdentifierMockFactory } from '../../../../../../../test-utils/mocks/party-action-identifier-mock-factory';
import { PartyIdentifierMockFactory } from '../../../../../../../test-utils/mocks/party-identifier-mock-factory';
import { PartyPinIdentifierMockFactory } from '../../../../../../../test-utils/mocks/party-pin-identifier-mock-factory';
import { StageIdentifierMockFactory } from '../../../../../../../test-utils/mocks/stage-identifier-mock-factory';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
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
      phase: PARTY_RUNTIME_PHASE.STAGE,
      stageId,
      stagePosition: 0,
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
        stageId,
        stagePosition: 0,
        text: 'Who wins the final?',
      },
    },
  });
}

function createResultParty(): PartyObservation {
  return createPredictionParty({
    lifecycle: {
      phase: PARTY_RUNTIME_PHASE.RESULT,
      stageId,
      stagePosition: 0,
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
        stageId,
        stagePosition: 0,
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

describe('prediction runtime panels', () => {
  it('renders the host prediction stage from party state', () => {
    renderWithUiProvider(<PredictionHostStagePanel party={createStageParty()} />);

    expect(screen.getByTestId('prediction-host-stage-panel')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Who wins the final?' })).toBeInTheDocument();
    expect(screen.getByText('Home wins')).toBeInTheDocument();
    expect(screen.getByText('Away wins')).toBeInTheDocument();
    expect(
      screen.getByText('game.types.prediction.runtime.submissionProgress:submitted=1,total=3'),
    ).toBeInTheDocument();
  });

  it('submits the selected prediction action from the player stage', () => {
    const onSubmitAction = vi.fn();

    renderWithUiProvider(
      <PredictionPlayerStageSurface
        onLeaveParty={vi.fn()}
        onSubmitAction={onSubmitAction}
        party={createStageParty()}
        pendingActionId={null}
        playerActionErrorMessage={null}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Away wins' }));

    expect(onSubmitAction).toHaveBeenCalledWith(secondActionId);
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
