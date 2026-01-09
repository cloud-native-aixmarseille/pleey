import { describe, expect, it, vi } from 'vitest';
import type { QuizRepository } from '../../../domain/quiz/repositories/quiz.repository.interface';
import { createQuizFixture } from '../../../test-utils/fixtures';
import { GetAllQuizzesUseCase } from './get-all-quizzes.use-case';

describe('GetAllQuizzesUseCase', () => {
  it('returns quizzes provided by the repository', async () => {
    const quizzes = [createQuizFixture()];

    const quizRepository: QuizRepository = {
      create: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn().mockResolvedValue(quizzes),
      findByCreator: vi.fn(),
      findByOrganization: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    };

    const useCase = new GetAllQuizzesUseCase(quizRepository);
    const result = await useCase.execute();

    expect(result).toEqual(quizzes);
    expect(quizRepository.findAll).toHaveBeenCalledTimes(1);
  });
});
