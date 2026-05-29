import { Inject, Injectable } from '@nestjs/common';
import type { Prediction } from '../../../../../domain/game/types/prediction/entities/prediction';
import type { PredictionManagementRepository } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import { PredictionManagementRepositoryProvider } from '../../../../../domain/game/types/prediction/ports/prediction-management.repository';
import type { UserId } from '../../../../../domain/identity/entities/user';
import type { ProjectId } from '../../../../../domain/project/entities/project';
import { GameTypeManagementAccessGuard } from '../../shared/services/game-type-management-access-guard';
import type { PlayableContentImportSource } from '../../shared/services/playable-content-import/import-source';
import { PredictionImportPromptMapper } from '../services/prediction-import-prompt-mapper';

interface CreatePredictionFromImportCommand {
  readonly description: string | null;
  readonly projectId: ProjectId;
  readonly source: PlayableContentImportSource;
  readonly title: string;
}

@Injectable()
export class CreatePredictionFromImportUseCase {
  constructor(
    @Inject(PredictionManagementRepositoryProvider)
    private readonly predictionRepository: PredictionManagementRepository,
    private readonly accessGuard: GameTypeManagementAccessGuard,
    private readonly importPromptMapper: PredictionImportPromptMapper,
  ) {}

  async execute(command: CreatePredictionFromImportCommand, userId: UserId): Promise<Prediction> {
    await this.accessGuard.assertCanManageProject(command.projectId, userId);

    const prompts = await this.importPromptMapper.map(command.source);

    return this.predictionRepository.createWithPrompts({
      description: command.description,
      projectId: command.projectId,
      prompts,
      title: command.title,
    });
  }
}
