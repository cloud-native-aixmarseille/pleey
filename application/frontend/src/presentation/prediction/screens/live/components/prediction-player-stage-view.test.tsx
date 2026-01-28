import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { PredictionPlayerStageView } from './prediction-player-stage-view';

vi.mock('../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

describe('PredictionPlayerStageView', () => {
  it('submits the selected action while responses are open', async () => {
    const user = userEvent.setup();
    const onSubmitAction = vi.fn();

    renderWithProviders(
      <PredictionPlayerStageView
        stage={{
          id: 1,
          sourceId: 1,
          position: 0,
          text: 'Who will win?',
          type: 'prediction',
          actions: [],
          timeLimit: 20,
          points: 100,
        }}
        resolvedActions={[
          { id: 1, text: 'Team A', isSelected: false },
          { id: 2, text: 'Team B', isSelected: true },
        ]}
        actionSubmitted={false}
        isPaused={false}
        timeLeft={15}
        onSubmitAction={onSubmitAction}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Team B' }));

    expect(screen.getByText('Who will win?')).toBeInTheDocument();
    expect(onSubmitAction).toHaveBeenCalledWith(2);
    expect(screen.queryByText('prediction.runtime.responseLocked')).not.toBeInTheDocument();
  });

  it('locks response buttons and shows the submitted banner once an answer is sent', () => {
    renderWithProviders(
      <PredictionPlayerStageView
        stage={{
          id: 1,
          sourceId: 1,
          position: 0,
          text: 'Who will win?',
          type: 'prediction',
          actions: [],
          timeLimit: 20,
          points: 100,
        }}
        resolvedActions={[
          { id: 1, text: 'Team A', isSelected: false },
          { id: 2, text: 'Team B', isSelected: true },
        ]}
        actionSubmitted
        isPaused={false}
        timeLeft={15}
        onSubmitAction={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Team A' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Team B' })).toBeDisabled();
    expect(screen.getByText('prediction.runtime.responseLocked')).toBeInTheDocument();
  });
});
