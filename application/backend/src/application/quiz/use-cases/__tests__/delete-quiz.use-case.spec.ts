import { ConflictException, NotFoundException } from '@nestjs/common';
import { describe, expect, it, vi, beforeEach, type Mocked } from 'vitest';
import { Quiz } from '../../../../domain/quiz/entities/quiz.entity';
import type { QuizRepository } from '../../../../domain/quiz/repositories/quiz.repository.interface';
import type { GameSessionRepository } from '../../../../domain/game/repositories/game-session.repository.interface';
import { DeleteQuizUseCase } from '../delete-quiz.use-case';
import { QuizErrorCode } from '../../enums/quiz-error-code.enum';

describe('DeleteQuizUseCase', () => {
  let quizRepository: Mocked<QuizRepository>;
  let gameSessionRepository: Mocked<GameSessionRepository>;
  let useCase: DeleteQuizUseCase;

  beforeEach(() => {
    quizRepository = {
      findById: vi.fn(),
      delete: vi.fn(),
      create: vi.fn(),
      findAll: vi.fn(),
      findByCreator: vi.fn(),
      findByOrganization: vi.fn(),
      update: vi.fn(),
    } as unknown as Mocked<QuizRepository>;

    gameSessionRepository = {
      countActiveByQuizId: vi.fn(),
      create: vi.fn(),
      deleteOldSessions: vi.fn(),
      findActiveByAdminId: vi.fn(),
      findActiveByQuizId: vi.fn(),
      findByQuizId: vi.fn(),
      findById: vi.fn(),
      findByOrganization: vi.fn(),
      findByPin: vi.fn(),
      updateCurrentQuestion: vi.fn(),
      updateStatus: vi.fn(),
    } as unknown as Mocked<GameSessionRepository>;

    useCase = new DeleteQuizUseCase(quizRepository, gameSessionRepository);
  });

  it('should delete quiz when no active sessions exist', async () => {
    const quiz = new Quiz(1, 'Title', 'Desc', 1, 1, new Date());
    quizRepository.findById.mockResolvedValue(quiz);
    gameSessionRepository.countActiveByQuizId.mockResolvedValue(0);

    await useCase.execute(1);

    expect(quizRepository.delete).toHaveBeenCalledWith(1);
  });

  it('should throw when quiz does not exist', async () => {
    quizRepository.findById.mockResolvedValue(null);

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
    const quiz = new Quiz(1, 'Title', 'Desc', 1, 1, new Date());
    quizRepository.findById.mockResolvedValue(quiz);
    gameSessionRepository.countActiveByQuizId.mockResolvedValue(2);

    await useCase.execute(1).then(
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
