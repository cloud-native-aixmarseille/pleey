import { act, fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PartyStageFixtureFactory } from '../../../../../../../test-utils/fixtures/party-stage-fixture-factory';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { KeyboardShortcutsProvider } from '../../../../../../shared/keyboard';
import { quizRuntimeCopy } from '../../../../quiz/screens/live/components/quiz-runtime-copy';
import { PlayableChoicePlayerStageSurface } from './playable-choice-player-stage-surface';

vi.mock('../../../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );
  return new PresentationTranslationMockFactory().createModule();
});

const fixtures = new PartyStageFixtureFactory();

describe('PlayableChoicePlayerStageSurface reading time', () => {
  it.each([false, true])(
    'hides all answers and ignores keyboard shortcuts during reading (mobile/reduced motion: %s)',
    (matches) => {
      // Arrange
      vi.useFakeTimers();
      vi.setSystemTime(100_000);
      vi.stubGlobal('matchMedia', (media: string) => ({
        matches,
        media,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      }));
      const onSubmitAction = vi.fn();
      try {
        // Act
        renderWithUiProvider(
          <KeyboardShortcutsProvider>
            <PlayableChoicePlayerStageSurface
              copy={quizRuntimeCopy}
              testIdPrefix="quiz"
              party={fixtures.createObservation()}
              onLeaveParty={vi.fn()}
              onSubmitAction={onSubmitAction}
              pendingActionId={null}
              playerActionErrorMessage={null}
            />
          </KeyboardShortcutsProvider>,
        );
        fireEvent.keyDown(document, { key: '1' });
        // Assert
        expect(screen.getByText('Which answer?')).toBeInTheDocument();
        expect(screen.queryByText('First answer')).not.toBeInTheDocument();
        expect(screen.queryByText('Second answer')).not.toBeInTheDocument();
        expect(onSubmitAction).not.toHaveBeenCalled();
      } finally {
        vi.useRealTimers();
        vi.unstubAllGlobals();
      }
    },
  );

  it.each([false, true])('shows every answer and enables submission when reading ends (untimed: %s)', (untimed) => {
    // Arrange
    vi.useFakeTimers();
    vi.setSystemTime(100_000);
    const onSubmitAction = vi.fn();
    const party = fixtures.createObservation(
      untimed ? { stageEndsAtEpochMs: null, stageTimeLimitSeconds: 0, stageRemainingDurationMs: null } : {},
    );
    renderWithUiProvider(
      <KeyboardShortcutsProvider>
        <PlayableChoicePlayerStageSurface
          copy={quizRuntimeCopy}
          testIdPrefix="quiz"
          party={party}
          onLeaveParty={vi.fn()}
          onSubmitAction={onSubmitAction}
          pendingActionId={null}
          playerActionErrorMessage={null}
        />
      </KeyboardShortcutsProvider>,
    );
    try {
      // Act
      act(() => vi.advanceTimersByTime(3_000));
      fireEvent.click(screen.getByRole('button', { name: 'First answer' }));
      // Assert
      expect(screen.getByRole('button', { name: 'Second answer' })).toBeEnabled();
      expect(onSubmitAction).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('shows answers immediately when reconnecting after the reading deadline', () => {
    // Arrange
    vi.useFakeTimers();
    vi.setSystemTime(105_000);
    try {
      // Act
      renderWithUiProvider(
        <KeyboardShortcutsProvider>
          <PlayableChoicePlayerStageSurface
            copy={quizRuntimeCopy}
            testIdPrefix="quiz"
            party={fixtures.createObservation()}
            onLeaveParty={vi.fn()}
            onSubmitAction={vi.fn()}
            pendingActionId={null}
            playerActionErrorMessage={null}
          />
        </KeyboardShortcutsProvider>,
      );
      // Assert
      expect(screen.getByRole('button', { name: 'First answer' })).toBeEnabled();
      expect(screen.getByRole('button', { name: 'Second answer' })).toBeEnabled();
    } finally {
      vi.useRealTimers();
    }
  });
});
