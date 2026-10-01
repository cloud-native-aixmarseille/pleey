import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { PartyRuntimePhase } from '../../../../../../../domains/game/party/shared/entities/party-runtime-context';
import { DEFAULT_PARTY_SETTINGS } from '../../../../../../../domains/game/party/shared/entities/party-settings';
import { PartyStatus } from '../../../../../../../domains/game/party/shared/entities/party-status';
import { GameType } from '../../../../../../../domains/game/types/shared/game-type';
import { PartyActionIdentifierMockFactory } from '../../../../../../../test-utils/mocks/party-action-identifier-mock-factory';
import { PartyIdentifierMockFactory } from '../../../../../../../test-utils/mocks/party-identifier-mock-factory';
import { PartyPinIdentifierMockFactory } from '../../../../../../../test-utils/mocks/party-pin-identifier-mock-factory';
import { StageIdentifierMockFactory } from '../../../../../../../test-utils/mocks/stage-identifier-mock-factory';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { KeyboardShortcutsProvider } from '../../../../../../shared/keyboard';
import { QuizPlayerResultSurface } from './quiz-player-result-surface';
import { QuizPlayerStageSurface } from './quiz-player-stage-surface';

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

describe('QuizPlayerStageSurface', () => {
  it('toggles multiple answers and submits the selected set once', () => {
    // Arrange
    vi.useFakeTimers();
    vi.setSystemTime(1_000);
    vi.stubGlobal('matchMedia', () => ({
      addEventListener: vi.fn(),
      addListener: vi.fn(),
      dispatchEvent: vi.fn(),
      matches: true,
      media: '(max-width: 48em)',
      onchange: null,
      removeEventListener: vi.fn(),
      removeListener: vi.fn(),
    }));
    const firstActionId = partyActionIdentifier.parse(101);
    const secondActionId = partyActionIdentifier.parse(102);
    const onSubmitAction = vi.fn();
    const stageContext = {
      lifecycle: {
        phase: PartyRuntimePhase.STAGE as const,
        stageEndsAtEpochMs: 21_000,
        stageId: stageIdentifier.parse(10),
        stagePosition: 0,
        stageRemainingDurationMs: 20_000,
        stageTimeLimitSeconds: 20,
        totalStages: 1,
      },
      stage: {
        actionSubmission: {
          currentPlayer: null,
          submittedPlayerCount: 0,
          totalEligiblePlayerCount: 1,
        },
        current: {
          allowsMultipleSelections: true,
          actions: [
            { id: firstActionId, text: 'First answer' },
            { id: secondActionId, text: 'Second answer' },
          ],
          text: 'Choose every correct answer',
        },
      },
    };
    const party: PartyObservation = {
      context: stageContext,
      gameType: GameType.Quiz,
      host: { avatarUri: null, username: 'Host' },
      isObserverHost: false,
      partyId: partyIdentifier.parse(1),
      pin: partyPinIdentifier.parse('AB12CD'),
      players: [],
      settings: DEFAULT_PARTY_SETTINGS,
      status: PartyStatus.ACTIVE,
    };

    // Act
    const { rerender } = renderWithUiProvider(
      <KeyboardShortcutsProvider>
        <QuizPlayerStageSurface
          onLeaveParty={vi.fn()}
          onSubmitAction={onSubmitAction}
          party={party}
          pendingActionIds={null}
          playerActionErrorMessage={null}
        />
      </KeyboardShortcutsProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'First answer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Second answer' }));
    fireEvent.click(screen.getByRole('button', { name: 'game.types.quiz.runtime.submitAnswers' }));

    // Assert
    expect(screen.getByRole('button', { name: 'First answer' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Second answer' })).toHaveAttribute('aria-pressed', 'true');
    expect(onSubmitAction).toHaveBeenCalledTimes(1);
    expect(onSubmitAction).toHaveBeenCalledWith([firstActionId, secondActionId]);

    rerender(
      <KeyboardShortcutsProvider>
        <QuizPlayerStageSurface
          onLeaveParty={vi.fn()}
          onSubmitAction={onSubmitAction}
          party={{
            ...party,
            context: {
              ...stageContext,
              lifecycle: {
                ...stageContext.lifecycle,
                stageId: stageIdentifier.parse(11),
                stagePosition: 1,
              },
              stage: {
                ...stageContext.stage,
                current: {
                  ...stageContext.stage.current,
                  text: 'Next question',
                },
              },
            },
          }}
          pendingActionIds={null}
          playerActionErrorMessage={null}
        />
      </KeyboardShortcutsProvider>,
    );

    expect(screen.getByRole('button', { name: 'First answer' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Second answer' })).toHaveAttribute('aria-pressed', 'false');
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows partial points as a partially correct result', () => {
    // Arrange
    const actionId = partyActionIdentifier.parse(103);
    const stageId = stageIdentifier.parse(11);
    const party: PartyObservation = {
      context: {
        lifecycle: {
          phase: PartyRuntimePhase.RESULT,
          stageEndsAtEpochMs: null,
          stageId,
          stagePosition: 0,
          stageRemainingDurationMs: null,
          stageTimeLimitSeconds: null,
          totalStages: 1,
        },
        result: {
          current: {
            actions: [
              {
                actionCount: 1,
                actionPercent: 100,
                earnedPoints: 1_000,
                id: actionId,
                isCorrect: true,
                text: 'Correct answer',
              },
            ],
            text: 'Question',
          },
          currentPlayer: {
            earnedPoints: 500,
            isCorrect: false,
            selectedActionId: actionId,
            selectedActionIds: [actionId],
          },
        },
      },
      gameType: GameType.Quiz,
      host: { avatarUri: null, username: 'Host' },
      isObserverHost: false,
      partyId: partyIdentifier.parse(1),
      pin: partyPinIdentifier.parse('AB12CD'),
      players: [],
      settings: DEFAULT_PARTY_SETTINGS,
      status: PartyStatus.ACTIVE,
    };

    // Act
    renderWithUiProvider(<QuizPlayerResultSurface onLeaveParty={vi.fn()} party={party} />);

    // Assert
    expect(screen.getByText('game.types.quiz.runtime.resultPartiallyCorrect')).toBeInTheDocument();
    expect(screen.getByText('game.types.quiz.runtime.pointsAwarded:points=500')).toBeInTheDocument();
  });
});
