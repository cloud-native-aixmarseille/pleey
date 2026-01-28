import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { ListProjectQuizzesUseCase } from './list-project-quizzes-use-case';

describe('ListProjectQuizzesUseCase', () => {
  describe('execute()', () => {
    it('requests quizzes for the selected project', async () => {
      // Arrange
      const quizRepository = {
        getQuizzesByProject: vi.fn().mockResolvedValue([{ id: 7 }]),
      };
      const useCase = new ListProjectQuizzesUseCase(quizRepository as never);

      // Act
      await useCase.execute({ projectId: 12 });

      // Assert
      expect(quizRepository.getQuizzesByProject).toHaveBeenCalledWith(12);
    });
  });
});
