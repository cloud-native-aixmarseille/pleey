import { act, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PartyStageFixtureFactory } from '../../../../../../../test-utils/fixtures/party-stage-fixture-factory';
import { renderWithUiProvider } from '../../../../../../../test-utils/render-with-ui-provider';
import { quizRuntimeCopy } from '../../../../quiz/screens/live/components/quiz-runtime-copy';
import { PlayableChoiceHostStagePanel } from './playable-choice-host-stage-panel';

vi.mock('../../../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/mocks/presentation-translation-mock-factory'
  );
  return new PresentationTranslationMockFactory().createModule();
});

describe('PlayableChoiceHostStagePanel', () => {
  it.each([
    { elapsed: 2_999, visible: false },
    { elapsed: 3_000, visible: true },
  ])('shows all host answers only after reading ($elapsed ms)', ({ elapsed, visible }) => {
    // Arrange
    vi.useFakeTimers();
    vi.setSystemTime(100_000);
    const party = new PartyStageFixtureFactory().createObservation();
    // Act + Assert
    try {
      renderWithUiProvider(<PlayableChoiceHostStagePanel copy={quizRuntimeCopy} testIdPrefix="quiz" party={party} />);
      // Act
      act(() => vi.advanceTimersByTime(elapsed));
      // Assert
      expect(screen.getByRole('heading', { name: 'Which answer?' })).toBeInTheDocument();
      expect(screen.getByText('game.types.quiz.runtime.stageProgress (current=1, total=3)')).toBeVisible();
      expect(screen.queryAllByText(/^(First|Second) answer$/)).toHaveLength(visible ? 2 : 0);
    } finally {
      vi.useRealTimers();
    }
  });
});
