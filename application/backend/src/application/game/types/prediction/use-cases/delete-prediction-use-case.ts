import { Inject, Injectable } from '@nestjs/common';
import { PredictionErrorCode } from '../../../../../domain/game/types/prediction/enums/prediction-error-code.enum';
import type { PredictionManagementRepository } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import { PredictionManagementRepositoryProvider } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import type { GameTypeId } from '../../../../../domain/game/types/shared/entities/game-type';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';

@Injectable()
export class DeletePredictionUseCase {
  constructor(
    @Inject(PredictionManagementRepositoryProvider)
    private readonly predictionRepository: PredictionManagementRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
  ) {}

  async execute(predictionId: GameTypeId, userId: UserId): Promise<boolean> {
    const prediction = await this.predictionRepository.findById(predictionId);
    if (!prediction) {
      throw new Error(PredictionErrorCode.PREDICTION_NOT_FOUND);
    }

    await this.accessGuard.assertCanManageProject(prediction.projectId, userId);

    if (await this.predictionRepository.hasActiveParty(prediction.gameId)) {
      throw new Error(PredictionErrorCode.PREDICTION_HAS_ACTIVE_PARTY);
    }

    await this.predictionRepository.delete(prediction.id);

    return true;
  }
}
