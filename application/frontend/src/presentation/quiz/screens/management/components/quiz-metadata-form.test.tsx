import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Quiz } from '../../../../../domains/quiz/entities/quiz';
import { renderWithProviders } from '../../../../../test-utils/render-with-providers';
import { QuizMetadataForm } from './quiz-metadata-form';

vi.mock('../../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

const QUIZ: Quiz = {
  id: 7,
  gameId: 17,
  title: 'Quarterly quiz',
  description: 'Leadership all-hands',
  createdAt: '2026-03-15T10:00:00.000Z',
  questionCount: 2,
};

describe('QuizMetadataForm', () => {
  it('renders the title and description fields with quiz values', () => {
    renderWithProviders(<QuizMetadataForm quiz={QUIZ} onSave={vi.fn()} onSaved={vi.fn()} />);

    expect(screen.getByDisplayValue('Quarterly quiz')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Leadership all-hands')).toBeInTheDocument();
  });

  it('renders the save button', () => {
    renderWithProviders(<QuizMetadataForm quiz={QUIZ} onSave={vi.fn()} onSaved={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'quiz.management.saveMetadataAction' }),
    ).toBeInTheDocument();
  });

  it('shows a validation error when title is empty', async () => {
    const user = userEvent.setup();

    renderWithProviders(<QuizMetadataForm quiz={QUIZ} onSave={vi.fn()} onSaved={vi.fn()} />);

    await user.clear(screen.getByDisplayValue('Quarterly quiz'));
    await user.click(screen.getByRole('button', { name: 'quiz.management.saveMetadataAction' }));

    expect(screen.getByText('quiz.validation.titleRequired')).toBeInTheDocument();
  });

  it('calls onSave and onSaved after successful metadata update', async () => {
    const user = userEvent.setup();
    const updatedQuiz: Quiz = { ...QUIZ, title: 'Updated title', description: 'Updated desc' };
    const onSave = vi.fn().mockResolvedValue(updatedQuiz);
    const onSaved = vi.fn();

    renderWithProviders(<QuizMetadataForm quiz={QUIZ} onSave={onSave} onSaved={onSaved} />);

    await user.clear(screen.getByDisplayValue('Quarterly quiz'));
    await user.type(screen.getByLabelText(/quiz\.management\.titleLabel/), 'Updated title');
    await user.clear(screen.getByDisplayValue('Leadership all-hands'));
    await user.type(screen.getByLabelText(/quiz\.management\.descriptionLabel/), 'Updated desc');
    await user.click(screen.getByRole('button', { name: 'quiz.management.saveMetadataAction' }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(7, {
        title: 'Updated title',
        description: 'Updated desc',
      });
    });
    expect(onSaved).toHaveBeenCalledWith(updatedQuiz);
    expect(screen.getByText('quiz.success.metadataUpdated')).toBeInTheDocument();
  });

  it('shows an error message when save fails', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockRejectedValue(new Error('quiz.errors.updateFailed'));

    renderWithProviders(<QuizMetadataForm quiz={QUIZ} onSave={onSave} onSaved={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'quiz.management.saveMetadataAction' }));

    await waitFor(() => {
      expect(screen.getByText('quiz.errors.updateFailed')).toBeInTheDocument();
    });
  });
});
