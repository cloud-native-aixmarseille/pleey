import { Inject, Injectable } from '@nestjs/common';
import type { Prediction } from '../../../../../domain/game/types/prediction/entities/prediction';
import type { PredictionManagementRepository } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import { PredictionManagementRepositoryProvider } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import type { UserId } from '../../../../../domain/identity/entities/user';
import type { ProjectId } from '../../../../../domain/project/entities/project';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';

interface CreatePredictionCommand {
  readonly projectId: ProjectId;
  readonly title: string;
  readonly description: string | null;
}

@Injectable()
export class CreatePredictionUseCase {
  constructor(
    @Inject(PredictionManagementRepositoryProvider)
    private readonly predictionRepository: PredictionManagementRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
  ) {}

  async execute(command: CreatePredictionCommand, userId: UserId): Promise<Prediction> {
    await this.accessGuard.assertCanManageProject(command.projectId, userId);

    return this.predictionRepository.create(command);
  }
}
