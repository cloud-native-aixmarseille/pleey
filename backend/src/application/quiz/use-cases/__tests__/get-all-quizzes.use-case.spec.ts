import { describe, expect, it, vi } from 'vitest';
import { Quiz } from '../../../../domain/quiz/entities/quiz.entity';
import type { QuizRepository } from '../../../../domain/quiz/repositories/quiz.repository.interface';
import { GetAllQuizzesUseCase } from '../get-all-quizzes.use-case';

describe('GetAllQuizzesUseCase', () => {
  it('returns quizzes provided by the repository', async () => {
    const createdAt = new Date('2025-01-01T00:00:00.000Z');
    const quizzes = [new Quiz(1, 'Arcade Trivia', 'Fast-paced retro quiz', 42, createdAt)];

    const quizRepository: QuizRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn().mockResolvedValue(quizzes),
      findByCreator: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    };

    const useCase = new GetAllQuizzesUseCase(quizRepository);
    const result = await useCase.execute();

    expect(result).toEqual(quizzes);
    expect(quizRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
