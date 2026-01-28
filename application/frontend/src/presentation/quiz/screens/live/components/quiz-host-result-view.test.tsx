import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { QuizHostResultView } from './quiz-host-result-view';

vi.mock('../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('QuizHostResultView', () => {
  it('does not force a viewport-filling stage min-height on result layouts', () => {
    renderWithProviders(
      <QuizHostResultView
        stage={{
          id: 1,
          sourceId: 1,
          position: 0,
          text: 'Question',
          type: 'multiple',
          actions: [],
          timeLimit: 20,
          points: 100,
        }}
        actionResult={{ isCorrect: true, points: 100, correctActionIds: [1] }}
        resultDistribution={[
          {
            id: 1,
            text: 'A',
            actionCount: 3,
            actionPercent: 75,
            isCorrect: true,
            isSelected: false,
          },
        ]}
        stagePosition={1}
        totalStages={2}
      />,
    );

    expect(screen.getByTestId('quiz-host-result-layout')).toHaveStyle({
      minHeight: '0',
    });
  });
});
