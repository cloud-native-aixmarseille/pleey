import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import type { PredictionGameRepository } from '../../../domains/prediction/ports/prediction-game-repository';
import { PredictionGameRepositoryMockFactory } from '../../../test-utils/factories/prediction-game-repository-mock-factory';
import { DeletePredictionPromptUseCase } from './delete-prediction-prompt-use-case';

function createPredictionRepositoryMock(): PredictionGameRepository {
  return new PredictionGameRepositoryMockFactory().create();
}

describe('DeletePredictionPromptUseCase', () => {
  describe('execute()', () => {
    it('delegates prompt deletion to the repository', async () => {
      const predictionRepository = createPredictionRepositoryMock();
      const useCase = new DeletePredictionPromptUseCase(predictionRepository);

      await useCase.execute({ promptId: 13 });

      expect(predictionRepository.deletePredictionPrompt).toHaveBeenCalledWith(13);
    });
  });
});
