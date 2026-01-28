import { PredictionErrorCode } from '../../../domain/prediction/enums/prediction-error-code.enum';
import { PredictionOptionService } from '../../../domain/prediction/services/prediction-option-service';
import { createPredictionPromptFixture } from '../../../test-utils/fixtures/unit/prediction-prompt.fixture';
import { createPredictionPromptRepositoryMock } from '../../../test-utils/mock-factories/prediction-prompt-repository.mock-factory';
import { UpdatePredictionPromptUseCase } from './update-prediction-prompt-use-case';

describe('UpdatePredictionPromptUseCase', () => {
  it('should update existing prompt', async () => {
    const existing = createPredictionPromptFixture();
    const updated = createPredictionPromptFixture({
      id: existing.id,
      promptText: 'Updated',
    });

    const promptRepository = createPredictionPromptRepositoryMock({
      findById: existing,
      update: updated,
    });

    const useCase = new UpdatePredictionPromptUseCase(
      promptRepository as never,
      new PredictionOptionService(),
    );

    const result = await useCase.execute(existing.id, {
      promptText: 'Updated',
    });

    expect(promptRepository.update).toHaveBeenCalledWith(
      existing.id,
      expect.objectContaining({ promptText: 'Updated' }),
    );
    expect(result.promptText).toBe('Updated');
  });

  it('should throw when prompt does not exist', async () => {
    const promptRepository = createPredictionPromptRepositoryMock({ findById: null });
    const useCase = new UpdatePredictionPromptUseCase(
      promptRepository as never,
      new PredictionOptionService(),
    );

    await expect(useCase.execute(999, { promptText: 'Nope' })).rejects.toThrow(
      PredictionErrorCode.PROMPT_NOT_FOUND,
    );
  });

  it('should throw when no correct option is provided', async () => {
    const existing = createPredictionPromptFixture();

    const promptRepository = createPredictionPromptRepositoryMock({ findById: existing });
    const useCase = new UpdatePredictionPromptUseCase(
      promptRepository as never,
      new PredictionOptionService(),
    );

    await expect(
      useCase.execute(existing.id, {
        options: [
          { text: 'Yes', position: 0, isCorrect: false },
          { text: 'No', position: 1, isCorrect: false },
        ],
      }),
    ).rejects.toThrow(PredictionErrorCode.INVALID_CORRECT_OPTION);
  });
});
