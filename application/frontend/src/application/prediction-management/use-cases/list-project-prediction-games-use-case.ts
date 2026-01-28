import { inject, injectable } from 'inversify';
import type { PredictionGame } from '../../../domains/prediction/entities/prediction-game';
import type { PredictionGameRepository } from '../../../domains/prediction/ports/prediction-game-repository';
import { PREDICTION_SERVICE_ID } from '../contracts/prediction-service-id';

interface ListProjectPredictionGamesCommand {
  readonly projectId: number;
}

@injectable()
export class ListProjectPredictionGamesUseCase {
  constructor(
    @inject(PREDICTION_SERVICE_ID.predictionGameRepository)
    private readonly predictionGameRepository: PredictionGameRepository,
  ) {}

  execute(command: ListProjectPredictionGamesCommand): Promise<PredictionGame[]> {
    return this.predictionGameRepository.getPredictionGamesByProject(command.projectId);
  }
}
