import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { QuizQuestionType } from '../../../../../domains/quiz/entities/quiz-question';
import { renderWithUiProvider } from '../../../../../test-utils/render-with-ui-provider';
import { RuntimeDependencyProvider } from '../../../../shared/di/use-runtime-dependency';
import { QuizQuestionDialog } from './quiz-question-dialog';

vi.mock('../../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

const quizQuestionManagementFacade = {
  createDefaultFormState: () => ({
    questionText: '',
    type: QuizQuestionType.MULTIPLE,
    answers: ['', ''],
    correctAnswers: [0],
    timeLimit: '30',
    points: '100',
  }),
  isMultipleChoice: () => true,
  canRemoveAnswer: () => false,
  changeType: vi.fn(),
  addAnswer: vi.fn(),
  removeAnswer: vi.fn(),
  updateAnswer: vi.fn(),
  toggleCorrectAnswer: vi.fn(),
};
const resolveRuntimeDependency = <T,>(): T => quizQuestionManagementFacade as T;

describe('QuizQuestionDialog', () => {
  function renderQuizQuestionDialog(
    overrides: Partial<React.ComponentProps<typeof QuizQuestionDialog>> = {},
  ) {
    const onClose = vi.fn();

    renderWithUiProvider(
      <RuntimeDependencyProvider value={resolveRuntimeDependency}>
        <QuizQuestionDialog
          editingQuestionId={null}
          errorMessage={null}
          formState={quizQuestionManagementFacade.createDefaultFormState()}
          isOpen
          isSubmitting={false}
          onCancelEdit={vi.fn()}
          onClose={onClose}
          onSubmit={vi.fn()}
          setFormState={vi.fn()}
          title="Add question"
          {...overrides}
        />
      </RuntimeDependencyProvider>,
    );

    return { onClose };
  }

  it('renders the create dialog with the form fields and create action', async () => {
    renderQuizQuestionDialog();

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('quiz.management.eyebrow')).toBeInTheDocument();
    expect(screen.getByText('Add question')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'quiz.management.createQuestionAction' }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('quiz.management.questionPlaceholder')).toBeInTheDocument();
  });

  it('calls onClose when the cancel action is clicked', async () => {
    const user = userEvent.setup();
    const { onClose } = renderQuizQuestionDialog();

    await user.click(screen.getByRole('button', { name: 'common.cancel' }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('shows the error banner and disables the update action while submitting', async () => {
    renderQuizQuestionDialog({
      editingQuestionId: 7,
      errorMessage: 'quiz.errors.saveFailed',
      isSubmitting: true,
      title: 'Edit question',
    });

    expect(await screen.findByText('quiz.errors.saveFailed')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'quiz.management.updateQuestionAction' }),
    ).toBeDisabled();
  });
});
