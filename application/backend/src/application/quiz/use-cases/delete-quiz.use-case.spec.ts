import { ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { createQuizFixture } from '../../../test-utils/fixtures';
import {
  createGameSessionRepositoryMock,
  createQuizRepositoryMock,
} from '../../../test-utils/mock-factories';
import { QuizErrorCode } from '../enums/quiz-error-code.enum';
import { DeleteQuizUseCase } from './delete-quiz.use-case';

describe('DeleteQuizUseCase', () => {
  it('should delete quiz when no active sessions exist', async () => {
    const quiz = createQuizFixture();
    const quizRepository = createQuizRepositoryMock({ findById: quiz });
    const gameSessionRepository = createGameSessionRepositoryMock({ countActiveByQuizId: 0 });
    const useCase = new DeleteQuizUseCase(quizRepository as never, gameSessionRepository as never);

    await useCase.execute(quiz.id);

    expect(quizRepository.delete).toHaveBeenCalledWith(quiz.id);
  });

  it('should throw when quiz does not exist', async () => {
    const quizRepository = createQuizRepositoryMock({ findById: null });
    const gameSessionRepository = createGameSessionRepositoryMock();
    const useCase = new DeleteQuizUseCase(quizRepository as never, gameSessionRepository as never);

    await useCase.execute(42).then(
      () => {
        throw new Error('Expected NotFoundException to be thrown');
      },
      (error) => {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe(QuizErrorCode.QUIZ_NOT_FOUND);
      },
    );
  });

  it('should throw when active sessions are present', async () => {
    const quiz = createQuizFixture();
    const quizRepository = createQuizRepositoryMock({ findById: quiz });
    const gameSessionRepository = createGameSessionRepositoryMock({ countActiveByQuizId: 2 });
    const useCase = new DeleteQuizUseCase(quizRepository as never, gameSessionRepository as never);

    await useCase.execute(quiz.id).then(
      () => {
        throw new Error('Expected ConflictException to be thrown');
      },
      (error) => {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(QuizErrorCode.QUIZ_HAS_ACTIVE_SESSION);
      },
    );
    expect(quizRepository.delete).not.toHaveBeenCalled();
  });
});
