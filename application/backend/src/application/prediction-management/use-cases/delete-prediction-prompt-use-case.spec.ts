import { PredictionErrorCode } from '../../../domain/prediction/enums/prediction-error-code.enum';
import { createPredictionPromptFixture } from '../../../test-utils/fixtures/unit/prediction-prompt.fixture';
import { createPredictionPromptRepositoryMock } from '../../../test-utils/mock-factories/prediction-prompt-repository.mock-factory';
import { DeletePredictionPromptUseCase } from './delete-prediction-prompt-use-case';

describe('DeletePredictionPromptUseCase', () => {
  it('should delete existing prompt', async () => {
    const prompt = createPredictionPromptFixture();
    const promptRepository = createPredictionPromptRepositoryMock({ findById: prompt });
    const useCase = new DeletePredictionPromptUseCase(promptRepository as never);

    await useCase.execute(prompt.id);

    expect(promptRepository.delete).toHaveBeenCalledWith(prompt.id);
  });

  it('should throw when prompt is missing', async () => {
    const promptRepository = createPredictionPromptRepositoryMock({ findById: null });
    const useCase = new DeletePredictionPromptUseCase(promptRepository as never);

    await expect(useCase.execute(99)).rejects.toThrow(PredictionErrorCode.PROMPT_NOT_FOUND);
  });
});
