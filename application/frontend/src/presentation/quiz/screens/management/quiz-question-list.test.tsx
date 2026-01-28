import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuizQuestionType } from '../../../../domains/quiz/entities/quiz-question';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { QuizQuestionList } from './quiz-question-list';

vi.mock('../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

describe('QuizQuestionList', () => {
  it('renders questions and delegates edit and delete actions', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn().mockResolvedValue(undefined);
    const question = {
      id: 7,
      quizId: 11,
      position: 1,
      questionText: 'What is 2 + 2?',
      type: QuizQuestionType.MULTIPLE,
      answers: [
        { id: 1, position: 1, text: '4', isCorrect: true },
        { id: 2, position: 2, text: '5', isCorrect: false },
      ],
      timeLimit: 30,
      points: 100,
    };

    renderWithUiProvider(
      <QuizQuestionList
        description="Quarterly review"
        onDelete={onDelete}
        onEdit={onEdit}
        questions={[question]}
        title="Questions"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'quiz.management.editAction' }));
    fireEvent.click(screen.getByRole('button', { name: 'quiz.management.deleteAction' }));

    expect(screen.getByText('1. What is 2 + 2?')).toBeInTheDocument();
    expect(onEdit).toHaveBeenCalledWith(question);
    expect(onDelete).toHaveBeenCalledWith(question);
  });
});
