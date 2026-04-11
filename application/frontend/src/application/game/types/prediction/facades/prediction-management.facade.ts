import { inject, injectable } from 'inversify';
import type { PredictionPromptId } from '../../../../../domains/game/types/prediction/entities/prediction-prompt-id';
import {
  type PredictionManagementRepository,
  PredictionManagementRepositoryToken,
} from '../../../../../domains/game/types/prediction/ports/prediction-management.repository';
import type { GameTypeId } from '../../../../../domains/game/types/shared/game-type';
import type {
  PlayableGameMetadataInput,
  PlayableManagementItem,
  PlayableManagementItemInput,
  PlayableManagementState,
} from '../../../../../domains/game/types/shared/management/playable-management';
import type { ProjectId } from '../../../../../domains/project/entities/project';
import type { PlayableManagementGateway } from '../../shared/contracts/playable-management.gateway';

@injectable()
export class PredictionManagementFacade implements PlayableManagementGateway<PredictionPromptId> {
  constructor(
    @inject(PredictionManagementRepositoryToken)
    private readonly repository: PredictionManagementRepository,
  ) {}

  createGame(projectId: ProjectId, input: PlayableGameMetadataInput): Promise<GameTypeId> {
    return this.repository.createPrediction(projectId, input);
  }

  load(predictionId: GameTypeId): Promise<PlayableManagementState<PredictionPromptId>> {
    return this.repository.load(predictionId);
  }

  async updateMetadata(predictionId: GameTypeId, input: PlayableGameMetadataInput): Promise<void> {
    await this.repository.updateMetadata(predictionId, input);
  }

  async deleteGame(predictionId: GameTypeId): Promise<void> {
    await this.repository.deletePrediction(predictionId);
  }

  createItem(
    predictionId: GameTypeId,
    input: PlayableManagementItemInput,
  ): Promise<PlayableManagementItem<PredictionPromptId>> {
    return this.repository.createPrompt(predictionId, input);
  }

  updateItem(
    itemId: PredictionPromptId,
    input: PlayableManagementItemInput,
  ): Promise<PlayableManagementItem<PredictionPromptId>> {
    return this.repository.updatePrompt(itemId, input);
  }

  async deleteItem(itemId: PredictionPromptId): Promise<void> {
    await this.repository.deletePrompt(itemId);
  }
}
