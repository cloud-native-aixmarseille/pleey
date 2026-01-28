import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { QuizQuestionType } from '../../../domains/quiz/entities/quiz-question';
import type { QuizRepository } from '../../../domains/quiz/ports/quiz-repository';
import { CreateQuizQuestionUseCase } from './create-quiz-question-use-case';
import { DeleteQuizQuestionUseCase } from './delete-quiz-question-use-case';
import { ListQuizQuestionsUseCase } from './list-quiz-questions-use-case';
import { UpdateQuizQuestionUseCase } from './update-quiz-question-use-case';
import { UpdateQuizUseCase } from './update-quiz-use-case';

function createQuizRepositoryMock(): QuizRepository {
  return {
    getQuizById: vi.fn(),
    getQuizzesByProject: vi.fn(),
    getQuizQuestions: vi.fn(),
    updateQuiz: vi.fn(),
    createQuizQuestion: vi.fn(),
    updateQuizQuestion: vi.fn(),
    deleteQuizQuestion: vi.fn(),
  };
}

describe('quiz management use-cases', () => {
  it('UpdateQuizUseCase delegates quiz updates to the repository', async () => {
    const quizRepository = createQuizRepositoryMock();
    const useCase = new UpdateQuizUseCase(quizRepository);
    const command = {
      quizId: 7,
      input: {
        title: 'Updated title',
        description: 'Updated description',
      },
    } as const;

    await useCase.execute(command);

    expect(quizRepository.updateQuiz).toHaveBeenCalledWith(command.quizId, command.input);
  });

  it('ListQuizQuestionsUseCase delegates question loading to the repository', async () => {
    const quizRepository = createQuizRepositoryMock();
    vi.mocked(quizRepository.getQuizQuestions).mockResolvedValue([]);
    const useCase = new ListQuizQuestionsUseCase(quizRepository);

    await useCase.execute({ quizId: 7 });

    expect(quizRepository.getQuizQuestions).toHaveBeenCalledWith(7);
  });

  it('CreateQuizQuestionUseCase delegates question creation to the repository', async () => {
    const quizRepository = createQuizRepositoryMock();
    const useCase = new CreateQuizQuestionUseCase(quizRepository);
    const command = {
      quizId: 7,
      position: 2,
      questionText: 'What is 2 + 2?',
      type: QuizQuestionType.MULTIPLE,
      answers: [
        { text: '3', position: 1, isCorrect: false },
        { text: '4', position: 2, isCorrect: true },
      ],
      timeLimit: 30,
      points: 100,
    } as const;

    await useCase.execute(command);

    expect(quizRepository.createQuizQuestion).toHaveBeenCalledWith(command);
  });

  it('UpdateQuizQuestionUseCase delegates question updates to the repository', async () => {
    const quizRepository = createQuizRepositoryMock();
    const useCase = new UpdateQuizQuestionUseCase(quizRepository);
    const command = {
      questionId: 13,
      input: {
        questionText: 'Updated question',
        points: 200,
      },
    } as const;

    await useCase.execute(command);

    expect(quizRepository.updateQuizQuestion).toHaveBeenCalledWith(
      command.questionId,
      command.input,
    );
  });

  it('DeleteQuizQuestionUseCase delegates question deletion to the repository', async () => {
    const quizRepository = createQuizRepositoryMock();
    const useCase = new DeleteQuizQuestionUseCase(quizRepository);

    await useCase.execute({ questionId: 13 });

    expect(quizRepository.deleteQuizQuestion).toHaveBeenCalledWith(13);
  });
});
