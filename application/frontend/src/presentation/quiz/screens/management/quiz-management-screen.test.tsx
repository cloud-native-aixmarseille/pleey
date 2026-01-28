import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { QuizQuestionType } from '../../../../domains/quiz/entities/quiz-question';
import { renderWithProviders } from '../../../../test-utils/render-with-providers';
import { QuizManagementScreen } from './quiz-management-screen';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock('../../../shared/i18n/use-presentation-translation', async (importOriginal) => {
  const { PresentationTranslationMockFactory } = await import(
    'src/test-utils/factories/presentation-translation-mock-factory'
  );

  return new PresentationTranslationMockFactory().createPartialModule(importOriginal);
});

vi.mock('../../../shared/routing/router', async (importOriginal) => {
  const { RoutingMockFactory } = await import('src/test-utils/factories/routing-mock-factory');

  return new RoutingMockFactory().createPartialModule(importOriginal, {
    navigate: mocks.navigate,
    params: { quizId: '7' },
  });
});

function createQuiz(overrides?: Partial<Record<string, unknown>>) {
  return {
    id: 7,
    gameId: 17,
    title: 'Quarterly quiz',
    description: 'Leadership all-hands',
    createdAt: '2026-03-15T10:00:00.000Z',
    questionCount: 2,
    ...overrides,
  };
}

function createQuestion(overrides?: Partial<Record<string, unknown>>) {
  return {
    id: 13,
    quizId: 7,
    position: 1,
    questionText: 'What is 2 + 2?',
    type: QuizQuestionType.MULTIPLE,
    answers: [
      { id: 1, text: '3', position: 1, isCorrect: false },
      { id: 2, text: '4', position: 2, isCorrect: true },
    ],
    timeLimit: 30,
    points: 100,
    ...overrides,
  };
}

describe('QuizManagementScreen', () => {
  beforeEach(() => {
    mocks.navigate.mockReset();
    vi.restoreAllMocks();
  });

  it('renders the page header with subtitle', async () => {
    renderWithProviders(
      <QuizManagementScreen
        createGameSession={vi.fn()}
        loadActiveSessions={vi.fn().mockResolvedValue([])}
        loadQuizManagementData={vi.fn().mockResolvedValue({ quiz: createQuiz(), questions: [] })}
        updateQuiz={vi.fn()}
        createQuizQuestion={vi.fn()}
        updateQuizQuestion={vi.fn()}
        deleteQuizQuestion={vi.fn()}
      />,
    );

    expect(await screen.findByText('quiz.management.title')).toBeInTheDocument();
    expect(screen.getByText('quiz.management.subtitle')).toBeInTheDocument();
  });

  it('shows the management context bar with quiz identity', async () => {
    renderWithProviders(
      <QuizManagementScreen
        createGameSession={vi.fn()}
        loadActiveSessions={vi.fn().mockResolvedValue([])}
        loadQuizManagementData={vi.fn().mockResolvedValue({
          quiz: createQuiz(),
          questions: [createQuestion()],
        })}
        updateQuiz={vi.fn()}
        createQuizQuestion={vi.fn()}
        updateQuizQuestion={vi.fn()}
        deleteQuizQuestion={vi.fn()}
      />,
    );

    const contextBar = await screen.findByRole('banner', {
      name: 'quiz.management.contextBarLabel',
    });
    expect(contextBar).toBeInTheDocument();
    expect(within(contextBar).getByText('Quarterly quiz')).toBeInTheDocument();
  });

  it('loads the restored quiz and its questions', async () => {
    const loadQuizManagementData = vi.fn().mockResolvedValue({
      quiz: createQuiz(),
      questions: [createQuestion()],
    });

    renderWithProviders(
      <QuizManagementScreen
        createGameSession={vi.fn()}
        loadActiveSessions={vi.fn().mockResolvedValue([])}
        loadQuizManagementData={loadQuizManagementData}
        updateQuiz={vi.fn()}
        createQuizQuestion={vi.fn()}
        updateQuizQuestion={vi.fn()}
        deleteQuizQuestion={vi.fn()}
      />,
    );

    expect(await screen.findByDisplayValue('Quarterly quiz')).toBeInTheDocument();
    expect(await screen.findByText('1. What is 2 + 2?')).toBeInTheDocument();
    expect(loadQuizManagementData).toHaveBeenCalledWith(7);
  });

  it('shows the missing state when the management loader cannot resolve the quiz', async () => {
    const loadQuizManagementData = vi.fn().mockResolvedValue({
      quiz: null,
      questions: [],
    });

    renderWithProviders(
      <QuizManagementScreen
        createGameSession={vi.fn()}
        loadActiveSessions={vi.fn().mockResolvedValue([])}
        loadQuizManagementData={loadQuizManagementData}
        updateQuiz={vi.fn()}
        createQuizQuestion={vi.fn()}
        updateQuizQuestion={vi.fn()}
        deleteQuizQuestion={vi.fn()}
      />,
    );

    expect(await screen.findByText('quiz.management.quizMissing')).toBeInTheDocument();
    expect(loadQuizManagementData).toHaveBeenCalledWith(7);
  });

  it('submits quiz metadata updates', async () => {
    const updatedQuiz = createQuiz({ title: 'Updated title', description: 'Updated description' });
    const updateQuiz = vi.fn().mockResolvedValue(updatedQuiz);

    renderWithProviders(
      <QuizManagementScreen
        createGameSession={vi.fn()}
        loadActiveSessions={vi.fn().mockResolvedValue([])}
        loadQuizManagementData={vi.fn().mockResolvedValue({ quiz: createQuiz(), questions: [] })}
        updateQuiz={updateQuiz}
        createQuizQuestion={vi.fn()}
        updateQuizQuestion={vi.fn()}
        deleteQuizQuestion={vi.fn()}
      />,
    );

    await screen.findByDisplayValue('Quarterly quiz');

    fireEvent.change(screen.getByLabelText(/quiz\.management\.titleLabel/), {
      target: { value: 'Updated title' },
    });
    fireEvent.change(screen.getByLabelText(/quiz\.management\.descriptionLabel/), {
      target: { value: 'Updated description' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'quiz.management.saveMetadataAction' }));

    await waitFor(() => {
      expect(updateQuiz).toHaveBeenCalledWith(7, {
        title: 'Updated title',
        description: 'Updated description',
      });
    });

    expect(await screen.findByRole('status')).toHaveTextContent('quiz.success.metadataUpdated');
  });

  it('navigates back to the dashboard', async () => {
    renderWithProviders(
      <QuizManagementScreen
        createGameSession={vi.fn()}
        loadActiveSessions={vi.fn().mockResolvedValue([])}
        loadQuizManagementData={vi.fn().mockResolvedValue({ quiz: createQuiz(), questions: [] })}
        updateQuiz={vi.fn()}
        createQuizQuestion={vi.fn()}
        updateQuizQuestion={vi.fn()}
        deleteQuizQuestion={vi.fn()}
      />,
    );

    await screen.findByDisplayValue('Quarterly quiz');

    fireEvent.click(screen.getByRole('button', { name: 'quiz.management.backAction' }));

    expect(mocks.navigate).toHaveBeenCalledWith('/workspace/dashboard');
  });

  it('creates, edits, and deletes quiz questions', async () => {
    const createQuizQuestion = vi.fn().mockResolvedValue({
      id: 18,
      quizId: 7,
      position: 2,
      questionText: 'Created question',
      type: QuizQuestionType.MULTIPLE,
      answers: [
        { id: 11, text: 'Wrong', position: 1, isCorrect: false },
        { id: 12, text: 'Right', position: 2, isCorrect: true },
      ],
      timeLimit: 45,
      points: 150,
    });
    const updateQuizQuestion = vi.fn().mockResolvedValue({
      id: 13,
      quizId: 7,
      position: 1,
      questionText: 'Edited question',
      type: QuizQuestionType.MULTIPLE,
      answers: [
        { id: 1, text: 'Alpha', position: 1, isCorrect: true },
        { id: 2, text: 'Beta', position: 2, isCorrect: false },
      ],
      timeLimit: 50,
      points: 250,
    });
    const deleteQuizQuestion = vi.fn().mockResolvedValue(undefined);

    renderWithProviders(
      <QuizManagementScreen
        createGameSession={vi.fn()}
        loadActiveSessions={vi.fn().mockResolvedValue([])}
        loadQuizManagementData={vi.fn().mockResolvedValue({
          quiz: createQuiz(),
          questions: [createQuestion({ questionText: 'Original question' })],
        })}
        updateQuiz={vi.fn()}
        createQuizQuestion={createQuizQuestion}
        updateQuizQuestion={updateQuizQuestion}
        deleteQuizQuestion={deleteQuizQuestion}
      />,
    );

    await screen.findByText('1. Original question');

    fireEvent.click(
      screen.getAllByRole('button', { name: 'quiz.management.createQuestionAction' })[0],
    );

    let dialog = await screen.findByRole('dialog');

    fireEvent.change(
      within(dialog).getByRole('textbox', { name: /quiz\.management\.questionLabel/ }),
      {
        target: { value: 'Created question' },
      },
    );
    const answerFields = within(dialog).getAllByLabelText(/quiz\.management\.answerLabel/);
    fireEvent.change(answerFields[0], { target: { value: 'Wrong' } });
    fireEvent.change(answerFields[1], { target: { value: 'Right' } });
    const correctGroup = within(dialog).getByRole('group', {
      name: /quiz\.management\.correctAnswerLabel/,
    });
    const createCheckboxes = within(correctGroup).getAllByRole('checkbox');
    fireEvent.click(createCheckboxes[1]);
    fireEvent.click(createCheckboxes[0]);
    fireEvent.change(within(dialog).getByLabelText(/quiz\.management\.timeLimitLabel/), {
      target: { value: '45' },
    });
    fireEvent.change(within(dialog).getByLabelText(/quiz\.management\.pointsLabel/), {
      target: { value: '150' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'quiz.management.createQuestionAction' }),
    );

    await waitFor(() => {
      expect(createQuizQuestion).toHaveBeenCalledWith({
        quizId: 7,
        position: 2,
        questionText: 'Created question',
        type: QuizQuestionType.MULTIPLE,
        answers: [
          { text: 'Wrong', position: 1, isCorrect: false },
          { text: 'Right', position: 2, isCorrect: true },
        ],
        timeLimit: 45,
        points: 150,
      });
    });

    expect(await screen.findByText('2. Created question')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'quiz.management.editAction' })[0]);

    dialog = await screen.findByRole('dialog');

    fireEvent.change(
      within(dialog).getByRole('textbox', { name: /quiz\.management\.questionLabel/ }),
      {
        target: { value: 'Edited question' },
      },
    );
    const editAnswerFields = within(dialog).getAllByLabelText(/quiz\.management\.answerLabel/);
    fireEvent.change(editAnswerFields[0], { target: { value: 'Alpha' } });
    fireEvent.change(editAnswerFields[1], { target: { value: 'Beta' } });
    const editCorrectGroup = within(dialog).getByRole('group', {
      name: /quiz\.management\.correctAnswerLabel/,
    });
    const editCheckboxes = within(editCorrectGroup).getAllByRole('checkbox');
    fireEvent.click(editCheckboxes[0]);
    fireEvent.click(editCheckboxes[1]);
    fireEvent.change(within(dialog).getByLabelText(/quiz\.management\.timeLimitLabel/), {
      target: { value: '50' },
    });
    fireEvent.change(within(dialog).getByLabelText(/quiz\.management\.pointsLabel/), {
      target: { value: '250' },
    });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'quiz.management.updateQuestionAction' }),
    );

    await waitFor(() => {
      expect(updateQuizQuestion).toHaveBeenCalledWith(13, {
        quizId: 7,
        position: 3,
        questionText: 'Edited question',
        type: QuizQuestionType.MULTIPLE,
        answers: [
          { text: 'Alpha', position: 1, isCorrect: true },
          { text: 'Beta', position: 2, isCorrect: false },
        ],
        timeLimit: 50,
        points: 250,
      });
    });

    expect(await screen.findByText('1. Edited question')).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'quiz.management.deleteAction' })[0]);

    fireEvent.click(
      await screen.findByRole('button', { name: 'quiz.management.deleteQuestionAction' }),
    );

    await waitFor(() => {
      expect(deleteQuizQuestion).toHaveBeenCalledWith(13);
    });
  }, 15000);
});
