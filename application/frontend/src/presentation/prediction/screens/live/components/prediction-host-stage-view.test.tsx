import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { PredictionHostStageView } from './prediction-host-stage-view';

vi.mock('../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('PredictionHostStageView', () => {
  it('renders the prompt, actions, and paused overlay', () => {
    renderWithProviders(
      <PredictionHostStageView
        stage={{
          id: 1,
          sourceId: 1,
          position: 0,
          text: 'Will it rain tomorrow?',
          type: 'prediction',
          actions: [],
          timeLimit: 20,
          points: 100,
        }}
        resolvedActions={[
          { id: 1, text: 'Yes', isSelected: false },
          { id: 2, text: 'No', isSelected: false },
        ]}
        isPaused
        stagePosition={1}
        totalStages={3}
        timeLeft={20}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Will it rain tomorrow?' })).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
    expect(screen.getByText('No')).toBeInTheDocument();
    expect(screen.getByText('prediction.runtime.paused')).toBeInTheDocument();
  });
});
