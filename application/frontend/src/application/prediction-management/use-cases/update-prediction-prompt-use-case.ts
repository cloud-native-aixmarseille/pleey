import { inject, injectable } from 'inversify';
import type { UpdatePredictionPromptInput } from '../../../domains/prediction/entities/prediction-management-input';
import type { PredictionPrompt } from '../../../domains/prediction/entities/prediction-prompt';
import type { PredictionGameRepository } from '../../../domains/prediction/ports/prediction-game-repository';
import { PREDICTION_SERVICE_ID } from '../contracts/prediction-service-id';

interface UpdatePredictionPromptCommand {
  readonly promptId: number;
  readonly input: UpdatePredictionPromptInput;
}

@injectable()
export class UpdatePredictionPromptUseCase {
  constructor(
    @inject(PREDICTION_SERVICE_ID.predictionGameRepository)
    private readonly predictionGameRepository: PredictionGameRepository,
  ) {}

  execute(command: UpdatePredictionPromptCommand): Promise<PredictionPrompt> {
    return this.predictionGameRepository.updatePredictionPrompt(command.promptId, command.input);
  }
}
