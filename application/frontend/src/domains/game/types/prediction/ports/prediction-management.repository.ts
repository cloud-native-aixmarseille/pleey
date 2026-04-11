import type { ProjectId } from '../../../../project/entities/project';
import type { GameTypeId } from '../../shared/game-type';
import type {
  PlayableGameMetadataInput,
  PlayableManagementItem,
  PlayableManagementItemInput,
  PlayableManagementState,
} from '../../shared/management/playable-management';
import type { PredictionPromptId } from '../entities/prediction-prompt-id';

export interface PredictionManagementRepository {
  createPrediction(projectId: ProjectId, input: PlayableGameMetadataInput): Promise<GameTypeId>;
  load(predictionId: GameTypeId): Promise<PlayableManagementState<PredictionPromptId>>;
  updateMetadata(predictionId: GameTypeId, input: PlayableGameMetadataInput): Promise<void>;
  deletePrediction(predictionId: GameTypeId): Promise<void>;
  createPrompt(
    predictionId: GameTypeId,
    input: PlayableManagementItemInput,
  ): Promise<PlayableManagementItem<PredictionPromptId>>;
  updatePrompt(
    promptId: PredictionPromptId,
    input: PlayableManagementItemInput,
  ): Promise<PlayableManagementItem<PredictionPromptId>>;
  deletePrompt(promptId: PredictionPromptId): Promise<void>;
}

export const PredictionManagementRepositoryToken = Symbol.for('PredictionManagementRepository');
