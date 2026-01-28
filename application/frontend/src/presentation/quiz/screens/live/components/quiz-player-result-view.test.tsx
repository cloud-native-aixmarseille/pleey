import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { QuizPlayerResultView } from './quiz-player-result-view';

vi.mock('../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('QuizPlayerResultView', () => {
  it('renders the correct-result banner with distribution badges', () => {
    renderWithProviders(
      <QuizPlayerResultView
        actionResult={{ isCorrect: true, points: 200, correctActionIds: [2] }}
        resultDistribution={[
          {
            id: 1,
            text: 'Alpha',
            actionCount: 2,
            actionPercent: 40,
            isCorrect: false,
            isSelected: true,
          },
          {
            id: 2,
            text: 'Beta',
            actionCount: 3,
            actionPercent: 60,
            isCorrect: true,
            isSelected: false,
          },
        ]}
      />,
    );

    expect(screen.getByText('+200')).toBeInTheDocument();
    expect(screen.getByText('quiz.runtime.resultCorrect')).toBeInTheDocument();
    expect(screen.getByText('quiz.runtime.correctBadge')).toBeInTheDocument();
    expect(screen.getByText('quiz.runtime.yourPickBadge')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
  });
});
