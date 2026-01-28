import type { PredictionGame } from '../entities/prediction-game';
import type {
  CreatePredictionPromptInput,
  UpdatePredictionPromptInput,
} from '../entities/prediction-management-input';
import type { PredictionPrompt } from '../entities/prediction-prompt';

export interface PredictionGameRepository {
  getPredictionGamesByProject(projectId: number): Promise<PredictionGame[]>;
  getPredictionPrompts(predictionId: number): Promise<PredictionPrompt[]>;
  createPredictionPrompt(input: CreatePredictionPromptInput): Promise<PredictionPrompt>;
  updatePredictionPrompt(
    promptId: number,
    input: UpdatePredictionPromptInput,
  ): Promise<PredictionPrompt>;
  deletePredictionPrompt(promptId: number): Promise<void>;
}
