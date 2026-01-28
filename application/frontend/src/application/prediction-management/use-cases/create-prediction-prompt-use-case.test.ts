import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import type { PredictionGameRepository } from '../../../domains/prediction/ports/prediction-game-repository';
import { PredictionGameRepositoryMockFactory } from '../../../test-utils/factories/prediction-game-repository-mock-factory';
import { CreatePredictionPromptUseCase } from './create-prediction-prompt-use-case';

function createPredictionRepositoryMock(): PredictionGameRepository {
  return new PredictionGameRepositoryMockFactory().create();
}

describe('CreatePredictionPromptUseCase', () => {
  describe('execute()', () => {
    it('delegates prompt creation to the repository', async () => {
      const predictionRepository = createPredictionRepositoryMock();
      const useCase = new CreatePredictionPromptUseCase(predictionRepository);
      const command = {
        predictionId: 21,
        position: 2,
        promptText: 'Where will the KPI land?',
        options: [
          { text: 'Above target', position: 1, isCorrect: true },
          { text: 'Below target', position: 2, isCorrect: false },
        ],
        timeLimit: 45,
        points: 150,
      } as const;

      await useCase.execute(command);

      expect(predictionRepository.createPredictionPrompt).toHaveBeenCalledWith(command);
    });
  });
});
