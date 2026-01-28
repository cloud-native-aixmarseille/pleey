import { inject, injectable } from 'inversify';
import type { PredictionGameRepository } from '../../../domains/prediction/ports/prediction-game-repository';
import { PREDICTION_SERVICE_ID } from '../contracts/prediction-service-id';

interface DeletePredictionPromptCommand {
  readonly promptId: number;
}

@injectable()
export class DeletePredictionPromptUseCase {
  constructor(
    @inject(PREDICTION_SERVICE_ID.predictionGameRepository)
    private readonly predictionGameRepository: PredictionGameRepository,
  ) {}

  execute(command: DeletePredictionPromptCommand): Promise<void> {
    return this.predictionGameRepository.deletePredictionPrompt(command.promptId);
  }
}
