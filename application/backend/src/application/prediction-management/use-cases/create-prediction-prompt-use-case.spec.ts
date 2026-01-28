import { PredictionErrorCode } from '../../../domain/prediction/enums/prediction-error-code.enum';
import { PredictionOptionService } from '../../../domain/prediction/services/prediction-option-service';
import { createPredictionPromptRepositoryMock } from '../../../test-utils/mock-factories/prediction-prompt-repository.mock-factory';
import { createPredictionRepositoryMock } from '../../../test-utils/mock-factories/prediction-repository.mock-factory';
import type { CreatePredictionPromptDto } from '../dto/create-prediction-prompt.dto';
import { CreatePredictionPromptUseCase } from './create-prediction-prompt-use-case';

describe('CreatePredictionPromptUseCase', () => {
  it('throws PREDICTION_NOT_FOUND when prediction does not exist', async () => {
    const promptRepository = createPredictionPromptRepositoryMock();
    const predictionRepository = createPredictionRepositoryMock({ findById: null });

    const useCase = new CreatePredictionPromptUseCase(
      promptRepository as never,
      predictionRepository as never,
      new PredictionOptionService(),
    );

    const dto: CreatePredictionPromptDto = {
      predictionId: 1,
      promptText: 'Will it happen?',
      options: [
        { text: 'Yes', position: 0, isCorrect: true },
        { text: 'No', position: 1, isCorrect: false },
      ],
    };

    await expect(useCase.execute(dto)).rejects.toThrow(PredictionErrorCode.PREDICTION_NOT_FOUND);
  });

  it('throws INVALID_CORRECT_OPTION for invalid options', async () => {
    const promptRepository = createPredictionPromptRepositoryMock();
    const predictionRepository = createPredictionRepositoryMock({ findById: { id: 1 } as never });

    const useCase = new CreatePredictionPromptUseCase(
      promptRepository as never,
      predictionRepository as never,
      new PredictionOptionService(),
    );

    const dto: CreatePredictionPromptDto = {
      predictionId: 1,
      promptText: 'Will it happen?',
      options: [
        { text: 'Yes', position: 0, isCorrect: false },
        { text: 'No', position: 1, isCorrect: false },
      ],
    };

    await expect(useCase.execute(dto)).rejects.toThrow(PredictionErrorCode.INVALID_CORRECT_OPTION);
  });

  it('creates a prompt with defaults', async () => {
    const promptRepository = createPredictionPromptRepositoryMock({ create: { id: 1 } as never });
    const predictionRepository = createPredictionRepositoryMock({ findById: { id: 1 } as never });

    const useCase = new CreatePredictionPromptUseCase(
      promptRepository as never,
      predictionRepository as never,
      new PredictionOptionService(),
    );

    const dto: CreatePredictionPromptDto = {
      predictionId: 1,
      promptText: 'Will it happen?',
      options: [
        { text: 'Yes', position: 0, isCorrect: true },
        { text: 'No', position: 1, isCorrect: false },
      ],
    };

    await useCase.execute(dto);

    expect(promptRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ predictionId: 1, timeLimit: 20, points: 1000 }),
    );
  });
});
