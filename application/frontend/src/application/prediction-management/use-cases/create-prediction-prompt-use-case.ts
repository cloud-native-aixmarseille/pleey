import { inject, injectable } from 'inversify';
import type { CreatePredictionPromptInput } from '../../../domains/prediction/entities/prediction-management-input';
import type { PredictionPrompt } from '../../../domains/prediction/entities/prediction-prompt';
import type { PredictionGameRepository } from '../../../domains/prediction/ports/prediction-game-repository';
import { PREDICTION_SERVICE_ID } from '../contracts/prediction-service-id';

@injectable()
export class CreatePredictionPromptUseCase {
  constructor(
    @inject(PREDICTION_SERVICE_ID.predictionGameRepository)
    private readonly predictionGameRepository: PredictionGameRepository,
  ) {}

  execute(input: CreatePredictionPromptInput): Promise<PredictionPrompt> {
    return this.predictionGameRepository.createPredictionPrompt(input);
  }
}
