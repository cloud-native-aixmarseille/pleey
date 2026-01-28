import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { QuizQuestionType } from '../../../../domains/quiz/entities/quiz-question';
import type { QuestionFormState } from '../../../../domains/quiz/entities/quiz-question-form-state';
import { renderWithUiProvider } from '../../../../test-utils/render-with-ui-provider';
import { RuntimeDependencyProvider } from '../../../shared/di/use-runtime-dependency';
import { QuizQuestionForm } from './quiz-question-form';

vi.mock('../../../shared/i18n/use-presentation-translation', async () => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createModule();
});

const MIN_MULTIPLE_ANSWERS = 2;

const quizQuestionManagementFacade = {
  createDefaultFormState: () => ({
    questionText: '',
    type: QuizQuestionType.MULTIPLE,
    answers: ['', ''],
    correctAnswers: [0],
    timeLimit: '30',
    points: '100',
  }),
  isMultipleChoice: (formState: QuestionFormState) => formState.type === QuizQuestionType.MULTIPLE,
  canRemoveAnswer: (formState: QuestionFormState) =>
    formState.answers.length > MIN_MULTIPLE_ANSWERS,
  changeType: (
    formState: QuestionFormState,
    value: string,
    trueFalseAnswers: readonly [string, string] | readonly string[],
  ) => ({
    ...formState,
    type:
      value === QuizQuestionType.TRUE_FALSE
        ? QuizQuestionType.TRUE_FALSE
        : QuizQuestionType.MULTIPLE,
    answers: value === QuizQuestionType.TRUE_FALSE ? [...trueFalseAnswers] : formState.answers,
    correctAnswers: [0],
  }),
  addAnswer: (formState: QuestionFormState) => ({
    ...formState,
    answers: [...formState.answers, ''],
  }),
  removeAnswer: (formState: QuestionFormState, index: number) => ({
    ...formState,
    answers: formState.answers.filter((_: string, answerIndex: number) => answerIndex !== index),
    correctAnswers: [1],
  }),
  updateAnswer: (formState: QuestionFormState, index: number, value: string) => ({
    ...formState,
    answers: formState.answers.map((answer: string, answerIndex: number) =>
      answerIndex === index ? value : answer,
    ),
  }),
  toggleCorrectAnswer: (formState: QuestionFormState, index: number) => ({
    ...formState,
    correctAnswers: formState.correctAnswers.includes(index)
      ? formState.correctAnswers
      : [...formState.correctAnswers, index],
  }),
};

const DEFAULT_QUESTION_FORM_STATE = quizQuestionManagementFacade.createDefaultFormState();
const resolveRuntimeDependency = <T,>(): T => quizQuestionManagementFacade as T;

function renderForm(overrides: Partial<Parameters<typeof QuizQuestionForm>[0]> = {}) {
  const setFormState = vi.fn();
  const defaultFormState = quizQuestionManagementFacade.createDefaultFormState();
  const props = {
    editingQuestionId: null,
    formState: defaultFormState,
    isSubmitting: false,
    onCancelEdit: vi.fn(),
    onSubmit: vi.fn(),
    setFormState,
    ...overrides,
  };

  renderWithUiProvider(
    <RuntimeDependencyProvider value={resolveRuntimeDependency}>
      <QuizQuestionForm {...props} />
    </RuntimeDependencyProvider>,
  );
  return { ...props, setFormState };
}

describe('QuizQuestionForm', () => {
  it('renders dynamic answer fields matching formState.answers length', () => {
    renderForm({
      formState: { ...DEFAULT_QUESTION_FORM_STATE, answers: ['A', 'B', 'C'] },
    });

    expect(screen.getAllByLabelText(/quiz\.management\.answerLabel/)).toHaveLength(3);
  });

  it('resets to true/false answers when type changes to trueFalse', () => {
    const { setFormState } = renderForm();

    fireEvent.change(screen.getByLabelText('quiz.management.typeLabel'), {
      target: { value: QuizQuestionType.TRUE_FALSE },
    });

    const updater = setFormState.mock.calls[0]?.[0] as (
      current: QuestionFormState,
    ) => QuestionFormState;
    const nextState = updater(quizQuestionManagementFacade.createDefaultFormState());

    expect(nextState.type).toBe(QuizQuestionType.TRUE_FALSE);
    expect(nextState.answers).toEqual([
      'quiz.management.trueOption',
      'quiz.management.falseOption',
    ]);
    expect(nextState.correctAnswers).toEqual([0]);
  });

  it('adds an answer field when clicking the add button', () => {
    const { setFormState } = renderForm();

    fireEvent.click(screen.getByRole('button', { name: /quiz\.management\.addAnswerAction/ }));

    const updater = setFormState.mock.calls[0]?.[0] as (
      current: QuestionFormState,
    ) => QuestionFormState;
    const nextState = updater(quizQuestionManagementFacade.createDefaultFormState());

    expect(nextState.answers).toHaveLength(
      quizQuestionManagementFacade.createDefaultFormState().answers.length + 1,
    );
  });

  it('keeps the add button visible regardless of answer count', () => {
    const manyAnswers = Array.from({ length: 8 }, (_, index) => `Answer ${index + 1}`);
    renderForm({
      formState: { ...DEFAULT_QUESTION_FORM_STATE, answers: manyAnswers },
    });

    expect(
      screen.getByRole('button', { name: /quiz\.management\.addAnswerAction/ }),
    ).toBeInTheDocument();
  });

  it('removes an answer field and adjusts correctAnswer', () => {
    const formState: QuestionFormState = {
      ...quizQuestionManagementFacade.createDefaultFormState(),
      answers: ['First', 'Second', 'Third'],
      correctAnswers: [2],
    };
    const { setFormState } = renderForm({ formState });

    const removeButtons = screen.getAllByRole('button', {
      name: /quiz\.management\.removeAnswerAction/,
    });
    fireEvent.click(removeButtons[0]);

    const updater = setFormState.mock.calls[0]?.[0] as (
      current: QuestionFormState,
    ) => QuestionFormState;
    const nextState = updater(formState);

    expect(nextState.answers).toHaveLength(2);
    expect(nextState.correctAnswers).toEqual([1]);
  });

  it('hides remove buttons when at minimum answers', () => {
    const minAnswers = Array.from({ length: MIN_MULTIPLE_ANSWERS }, () => '');
    renderForm({
      formState: { ...quizQuestionManagementFacade.createDefaultFormState(), answers: minAnswers },
    });

    expect(
      screen.queryByRole('button', { name: /quiz\.management\.removeAnswerAction/ }),
    ).not.toBeInTheDocument();
  });

  it('shows create button for new question', () => {
    renderForm();

    expect(
      screen.getByRole('button', { name: 'quiz.management.createQuestionAction' }),
    ).toBeInTheDocument();
  });
});
