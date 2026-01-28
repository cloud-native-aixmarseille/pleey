import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { QuizHostStageView } from './quiz-host-stage-view';

vi.mock('../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('QuizHostStageView', () => {
  it('uses an available-height layout with a stretching answer grid', () => {
    renderWithProviders(
      <QuizHostStageView
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
        resolvedActions={[
          { id: 1, text: 'A', isSelected: false },
          { id: 2, text: 'B', isSelected: false },
        ]}
        stagePosition={1}
        totalStages={2}
        timeLeft={20}
        isPaused={false}
      />,
    );

    expect(screen.getByTestId('quiz-host-stage-layout')).toHaveStyle({
      minHeight: '0',
      flex: '1',
    });
    expect(document.querySelector('[data-stage-fill-grid]')).toHaveStyle({
      gridAutoRows: 'minmax(0, 1fr)',
      flex: '1',
      justifyContent: 'center',
    });
  });
});
