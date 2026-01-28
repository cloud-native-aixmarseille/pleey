import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { ListProjectPredictionGamesUseCase } from './list-project-prediction-games-use-case';

describe('ListProjectPredictionGamesUseCase', () => {
  describe('execute()', () => {
    it('requests prediction games for the selected project', async () => {
      // Arrange
      const predictionGameRepository = {
        getPredictionGamesByProject: vi.fn().mockResolvedValue([{ id: 5 }]),
      };
      const useCase = new ListProjectPredictionGamesUseCase(predictionGameRepository as never);

      // Act
      await useCase.execute({ projectId: 33 });

      // Assert
      expect(predictionGameRepository.getPredictionGamesByProject).toHaveBeenCalledWith(33);
    });
  });
});
