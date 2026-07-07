import { Inject, Injectable } from '@nestjs/common';
import type { Prediction } from '../../../../../domain/game/types/prediction/entities/prediction';
import { PredictionNotFoundError } from '../../../../../domain/game/types/prediction/errors';
import type { PredictionManagementRepository } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import { PredictionManagementRepositoryProvider } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import type { GameTypeId } from '../../../../../domain/game/types/shared/entities/game-type';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';

@Injectable()
export class GetPredictionUseCase {
  constructor(
    @Inject(PredictionManagementRepositoryProvider)
    private readonly predictionRepository: PredictionManagementRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
  ) {}

  async execute(predictionId: GameTypeId, userId: UserId): Promise<Prediction> {
    const prediction = await this.predictionRepository.findById(predictionId);
    if (!prediction) {
      throw new PredictionNotFoundError({ predictionId });
    }

    await this.accessGuard.assertCanManageProject(prediction.projectId, userId);

    return prediction;
  }
}
