import { Inject, Injectable } from '@nestjs/common';
import type { Prediction } from '../../../../../domain/game/types/prediction/entities/prediction';
import { PredictionErrorCode } from '../../../../../domain/game/types/prediction/enums/prediction-error-code.enum';
import type { PredictionManagementRepository } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import { PredictionManagementRepositoryProvider } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import type { GameTypeId } from '../../../../../domain/game/types/shared/entities/game-type';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';

interface UpdatePredictionCommand {
  readonly predictionId: GameTypeId;
  readonly title: string;
  readonly description: string | null;
}

@Injectable()
export class UpdatePredictionUseCase {
  constructor(
    @Inject(PredictionManagementRepositoryProvider)
    private readonly predictionRepository: PredictionManagementRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
  ) {}

  async execute(command: UpdatePredictionCommand, userId: UserId): Promise<Prediction> {
    const prediction = await this.predictionRepository.findById(command.predictionId);
    if (!prediction) {
      throw new Error(PredictionErrorCode.PREDICTION_NOT_FOUND);
    }

    await this.accessGuard.assertCanManageProject(prediction.projectId, userId);

    return this.predictionRepository.update(prediction.id, {
      title: command.title,
      description: command.description,
    });
  }
}
