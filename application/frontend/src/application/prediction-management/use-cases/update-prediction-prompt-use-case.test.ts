import 'reflect-metadata';
import { describe, expect, it } from 'vitest';
import type { PredictionGameRepository } from '../../../domains/prediction/ports/prediction-game-repository';
import { PredictionGameRepositoryMockFactory } from '../../../test-utils/factories/prediction-game-repository-mock-factory';
import { UpdatePredictionPromptUseCase } from './update-prediction-prompt-use-case';

function createPredictionRepositoryMock(): PredictionGameRepository {
  return new PredictionGameRepositoryMockFactory().create();
}

describe('UpdatePredictionPromptUseCase', () => {
  describe('execute()', () => {
    it('delegates prompt updates to the repository', async () => {
      const predictionRepository = createPredictionRepositoryMock();
      const useCase = new UpdatePredictionPromptUseCase(predictionRepository);
      const command = {
        promptId: 13,
        input: {
          promptText: 'Updated prompt',
          points: 200,
        },
      } as const;

      await useCase.execute(command);

      expect(predictionRepository.updatePredictionPrompt).toHaveBeenCalledWith(
        command.promptId,
        command.input,
      );
    });
  });
});
