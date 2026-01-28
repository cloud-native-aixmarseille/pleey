import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { PredictionPromptList } from './prediction-prompt-list';

vi.mock('../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

describe('PredictionPromptList', () => {
  it('renders prompts and delegates edit and delete actions', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const prompt = {
      id: 3,
      predictionId: 9,
      position: 1,
      promptText: 'Who wins the hackathon?',
      options: [
        { id: 1, text: 'Team Alpha', position: 1, isCorrect: true },
        { id: 2, text: 'Team Beta', position: 2, isCorrect: false },
      ],
      timeLimit: 30,
      points: 100,
    };

    renderWithUiProvider(
      <PredictionPromptList onDelete={onDelete} onEdit={onEdit} prompts={[prompt]} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'prediction.management.editAction' }));
    fireEvent.click(screen.getByRole('button', { name: 'prediction.management.deleteAction' }));

    expect(screen.getByText('1. Who wins the hackathon?')).toBeInTheDocument();
    expect(onEdit).toHaveBeenCalledWith(prompt);
    expect(onDelete).toHaveBeenCalledWith(prompt);
  });
});
