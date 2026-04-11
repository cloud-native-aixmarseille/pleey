import { Inject, Injectable } from '@nestjs/common';
import type { PredictionPromptId } from '../../../../../domain/game/types/prediction/entities/prediction-prompt';
import { PredictionErrorCode } from '../../../../../domain/game/types/prediction/enums/prediction-error-code.enum';
import type { PredictionManagementRepository } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import { PredictionManagementRepositoryProvider } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import type { PredictionPromptRepository } from '../../../../../domain/game/types/prediction/ports/prediction-prompt.repository';
import { PredictionPromptRepositoryProvider } from '../../../../../domain/game/types/prediction/ports/prediction-prompt.repository';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';

@Injectable()
export class DeletePredictionPromptUseCase {
  constructor(
    @Inject(PredictionManagementRepositoryProvider)
    private readonly predictionRepository: PredictionManagementRepository,
    @Inject(PredictionPromptRepositoryProvider)
    private readonly promptRepository: PredictionPromptRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
  ) {}

  async execute(promptId: PredictionPromptId, userId: UserId): Promise<boolean> {
    const prompt = await this.promptRepository.findById(promptId);
    if (!prompt) {
      throw new Error(PredictionErrorCode.PROMPT_NOT_FOUND);
    }

    const prediction = await this.predictionRepository.findById(prompt.predictionId);
    if (!prediction) {
      throw new Error(PredictionErrorCode.PREDICTION_NOT_FOUND);
    }

    await this.accessGuard.assertCanManageProject(prediction.projectId, userId);
    await this.promptRepository.delete(promptId);

    return true;
  }
}
