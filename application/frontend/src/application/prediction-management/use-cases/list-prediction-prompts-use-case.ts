import { inject, injectable } from 'inversify';
import type { PredictionPrompt } from '../../../domains/prediction/entities/prediction-prompt';
import type { PredictionGameRepository } from '../../../domains/prediction/ports/prediction-game-repository';
import { PREDICTION_SERVICE_ID } from '../contracts/prediction-service-id';

interface ListPredictionPromptsCommand {
  readonly predictionId: number;
}

@injectable()
export class ListPredictionPromptsUseCase {
  constructor(
    @inject(PREDICTION_SERVICE_ID.predictionGameRepository)
    private readonly predictionGameRepository: PredictionGameRepository,
  ) {}

  execute(command: ListPredictionPromptsCommand): Promise<PredictionPrompt[]> {
    return this.predictionGameRepository.getPredictionPrompts(command.predictionId);
  }
}
