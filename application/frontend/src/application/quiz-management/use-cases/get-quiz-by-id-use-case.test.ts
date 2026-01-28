import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GetQuizByIdUseCase } from './get-quiz-by-id-use-case';

describe('GetQuizByIdUseCase', () => {
  describe('execute()', () => {
    it('requests the quiz matching the route id', async () => {
      const quizRepository = {
        getQuizById: vi.fn().mockResolvedValue({ id: 7 }),
      };
      const useCase = new GetQuizByIdUseCase(quizRepository as never);

      await useCase.execute({ quizId: 7 });

      expect(quizRepository.getQuizById).toHaveBeenCalledWith(7);
    });
  });
});
