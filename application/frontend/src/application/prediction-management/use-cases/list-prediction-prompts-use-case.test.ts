import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import type { PredictionGameRepository } from '../../../domains/prediction/ports/prediction-game-repository';
import { PredictionGameRepositoryMockFactory } from '../../../test-utils/factories/prediction-game-repository-mock-factory';
import { ListPredictionPromptsUseCase } from './list-prediction-prompts-use-case';

function createPredictionRepositoryMock(): PredictionGameRepository {
  return new PredictionGameRepositoryMockFactory().create();
}

describe('ListPredictionPromptsUseCase', () => {
  describe('execute()', () => {
    it('delegates prompt loading to the repository', async () => {
      const predictionRepository = createPredictionRepositoryMock();
      const useCase = new ListPredictionPromptsUseCase(predictionRepository);

      await useCase.execute({ predictionId: 21 });

      expect(predictionRepository.getPredictionPrompts).toHaveBeenCalledWith(21);
    });
  });
});
