import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { QuizPlayerStageView } from './quiz-player-stage-view';

vi.mock('../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('QuizPlayerStageView', () => {
  it('stretches the answer area to fill the available stage height', () => {
    renderWithProviders(
      <QuizPlayerStageView
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
        actionSubmitted={false}
        isPaused={false}
        timeLeft={20}
        onSubmitAction={vi.fn()}
      />,
    );

    expect(screen.getByTestId('quiz-player-stage-layout')).toHaveStyle({
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
