import { describe, expect, it } from 'vitest';
import { createPredictionPromptRepositoryMock } from '../../../test-utils/mock-factories/prediction-prompt-repository.mock-factory';
import { ListPredictionPromptsUseCase } from './list-prediction-prompts-use-case';

describe('ListPredictionPromptsUseCase', () => {
  it('returns prompts by prediction id', async () => {
    const promptRepository = createPredictionPromptRepositoryMock({
      findByPredictionId: [{ id: 1 }] as never,
    });

    const useCase = new ListPredictionPromptsUseCase(promptRepository as never);
    const result = await useCase.execute(10);

    expect(promptRepository.findByPredictionId).toHaveBeenCalledWith(10);
    expect(result).toEqual([{ id: 1 }]);
  });
});
