import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../test-utils/render-with-ui-provider';
import { QuizQuestionAnswerFields } from './quiz-question-answer-fields';

describe('QuizQuestionAnswerFields', () => {
  it('renders editable multiple-choice answers and delegates field actions', async () => {
    const user = userEvent.setup();
    const onAddAnswer = vi.fn();
    const onRemoveAnswer = vi.fn();
    const onAnswerChange = vi.fn();
    const onToggleCorrectAnswer = vi.fn();

    renderWithUiProvider(
      <QuizQuestionAnswerFields
        addAnswerLabel="Add answer"
        answerLabel={(position) => `Answer ${String(position)}`}
        answers={['Alpha', 'Beta']}
        canRemoveAnswer
        correctAnswers={[1]}
        isMultiple
        onAddAnswer={onAddAnswer}
        onAnswerChange={onAnswerChange}
        onRemoveAnswer={onRemoveAnswer}
        onToggleCorrectAnswer={onToggleCorrectAnswer}
        removeAnswerLabel={(position) => `Remove answer ${String(position)}`}
      />,
    );

    const firstAnswerInput = screen.getByLabelText('Answer 1');
    const secondAnswerToggle = screen.getByRole('checkbox', { checked: true });

    expect(firstAnswerInput).toHaveValue('Alpha');
    expect(screen.getByLabelText('Answer 2')).toHaveValue('Beta');
    expect(screen.getByRole('button', { name: 'Add answer' })).toBeInTheDocument();

    fireEvent.change(firstAnswerInput, { target: { value: 'Alpha updated' } });
    await user.click(secondAnswerToggle);
    await user.click(screen.getByRole('button', { name: 'Remove answer 2' }));
    await user.click(screen.getByRole('button', { name: 'Add answer' }));

    expect(onAnswerChange).toHaveBeenLastCalledWith(0, 'Alpha updated');
    expect(onToggleCorrectAnswer).toHaveBeenCalledWith(1);
    expect(onRemoveAnswer).toHaveBeenCalledWith(1);
    expect(onAddAnswer).toHaveBeenCalledTimes(1);
  });

  it('renders read-only true-false answers without add/remove controls', () => {
    renderWithUiProvider(
      <QuizQuestionAnswerFields
        addAnswerLabel="Add answer"
        answerLabel={(position) => `Answer ${String(position)}`}
        answers={['True', 'False']}
        canRemoveAnswer={false}
        correctAnswers={[0]}
        isMultiple={false}
        onAddAnswer={vi.fn()}
        onAnswerChange={vi.fn()}
        onRemoveAnswer={vi.fn()}
        onToggleCorrectAnswer={vi.fn()}
        removeAnswerLabel={(position) => `Remove answer ${String(position)}`}
      />,
    );

    const radios = screen.getAllByRole('radio');

    expect(radios).toHaveLength(2);
    expect(screen.getByLabelText('Answer 1')).toBeDisabled();
    expect(screen.getByLabelText('Answer 2')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Add answer' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Remove answer 1' })).not.toBeInTheDocument();
  });
});
