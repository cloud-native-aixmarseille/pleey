import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { PredictionPlayerResultView } from './prediction-player-result-view';

vi.mock('../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('PredictionPlayerResultView', () => {
  it('renders the incorrect-result banner with the hint message', () => {
    renderWithProviders(
      <PredictionPlayerResultView
        actionResult={{ isCorrect: false, points: 0, correctActionIds: [1] }}
        resultDistribution={[
          {
            id: 1,
            text: 'Yes',
            actionCount: 4,
            actionPercent: 80,
            isCorrect: true,
            isSelected: false,
          },
          {
            id: 2,
            text: 'No',
            actionCount: 1,
            actionPercent: 20,
            isCorrect: false,
            isSelected: true,
          },
        ]}
      />,
    );

    expect(screen.getByText('prediction.runtime.resultIncorrect')).toBeInTheDocument();
    expect(screen.getByText('prediction.runtime.resultIncorrectHint')).toBeInTheDocument();
    expect(screen.getByText('prediction.runtime.correctBadge')).toBeInTheDocument();
    expect(screen.getByText('prediction.runtime.yourPickBadge')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
  });
});
