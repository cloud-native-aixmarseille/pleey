import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithUiProvider } from '../../../../../test-utils/render-with-ui-provider';
import { QuizManagementQuestionsSection } from './quiz-management-questions-section';

describe('QuizManagementQuestionsSection', () => {
  it('renders management copy and delegates create-question clicks', async () => {
    const user = userEvent.setup();
    const onCreateQuestion = vi.fn();

    renderWithUiProvider(
      <QuizManagementQuestionsSection
        eyebrow="Questions"
        title="Quiz questions"
        description="Configure the quiz flow before launch."
        summary="4 questions configured"
        createQuestionLabel="Add question"
        onCreateQuestion={onCreateQuestion}
      />,
    );

    expect(screen.getByText('Questions')).toBeInTheDocument();
    expect(screen.getByText('Quiz questions')).toBeInTheDocument();
    expect(screen.getByText('Configure the quiz flow before launch.')).toBeInTheDocument();
    expect(screen.getByText('4 questions configured')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add question' }));

    expect(onCreateQuestion).toHaveBeenCalledTimes(1);
  });
});
