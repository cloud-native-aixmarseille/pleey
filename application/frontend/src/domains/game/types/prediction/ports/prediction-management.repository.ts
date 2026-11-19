import type { GameTypeId, PredictionPromptId } from '@pleey/domain/game';
import type { ProjectId } from '../../../../project/entities/project';
import type {
  PlayableContentImportCreationInput,
  PlayableContentImportCreationResult,
  PlayableGameMetadataInput,
  PlayableManagementItem,
  PlayableManagementItemInput,
  PlayableManagementState,
} from '../../shared/management/playable-management';

export interface PredictionManagementRepository {
  createPrediction(projectId: ProjectId, input: PlayableGameMetadataInput): Promise<GameTypeId>;
  createPredictionFromImport(
    projectId: ProjectId,
    input: PlayableContentImportCreationInput,
  ): Promise<PlayableContentImportCreationResult>;
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
