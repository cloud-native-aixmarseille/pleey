import { Inject, Injectable } from '@nestjs/common';
import type { PredictionPrompt } from '../../../../../domain/game/types/prediction/entities/prediction-prompt';
import { PredictionNotFoundError } from '../../../../../domain/game/types/prediction/errors';
import type { PredictionManagementRepository } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import { PredictionManagementRepositoryProvider } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import type { PredictionPromptRepository } from '../../../../../domain/game/types/prediction/ports/prediction-prompt.repository';
import { PredictionPromptRepositoryProvider } from '../../../../../domain/game/types/prediction/ports/prediction-prompt.repository';
import type { GameTypeId } from '../../../../../domain/game/types/shared/entities/game-type';
import type { UserId } from '../../../../../domain/identity/entities/user';
import type { PaginatedResult } from '../../../../../domain/shared/value-objects/paginated-result';
import type { PaginationQuery } from '../../../../../domain/shared/value-objects/pagination-query';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';

@Injectable()
export class ListPredictionPromptsUseCase {
  constructor(
    @Inject(PredictionManagementRepositoryProvider)
    private readonly predictionRepository: PredictionManagementRepository,
    @Inject(PredictionPromptRepositoryProvider)
    private readonly promptRepository: PredictionPromptRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
  ) {}

  async execute(
    predictionId: GameTypeId,
    userId: UserId,
    query: PaginationQuery,
  ): Promise<PaginatedResult<PredictionPrompt>> {
    const prediction = await this.predictionRepository.findById(predictionId);
    if (!prediction) {
      throw new PredictionNotFoundError({ predictionId });
    }

    await this.accessGuard.assertCanManageProject(prediction.projectId, userId);

    return this.promptRepository.findByPredictionId(prediction.id, query);
  }
}
