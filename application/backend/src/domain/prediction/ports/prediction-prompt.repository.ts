import type { PredictionId } from '../entities/prediction';
import type { PredictionOptionId } from '../entities/prediction-option';
import type { PredictionPrompt, PredictionPromptId } from '../entities/prediction-prompt';

export type PredictionOptionInput = {
  id?: PredictionOptionId;
  text?: string | null;
  position?: number;
  isCorrect?: boolean;
};

export const PredictionPromptRepositoryProvider = Symbol('PredictionPromptRepository');

export interface PredictionPromptRepository {
  create(data: {
    predictionId: PredictionId;
    position?: number;
    promptText: string;
    options: PredictionOptionInput[];
    timeLimit?: number;
    points?: number;
  }): Promise<PredictionPrompt>;

  findById(id: PredictionPromptId): Promise<PredictionPrompt | null>;

  findByPredictionId(predictionId: PredictionId): Promise<PredictionPrompt[]>;

  delete(id: PredictionPromptId): Promise<void>;

  update(
    id: PredictionPromptId,
    data: {
      predictionId?: PredictionId;
      position?: number;
      promptText?: string;
      options?: PredictionOptionInput[];
      timeLimit?: number;
      points?: number;
    },
  ): Promise<PredictionPrompt>;
}
