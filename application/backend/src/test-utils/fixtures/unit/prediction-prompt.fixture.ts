import type { PredictionId } from '../../../domain/prediction/entities/prediction';
import {
  PredictionOption,
  type PredictionOptionId,
} from '../../../domain/prediction/entities/prediction-option';
import {
  PredictionPrompt,
  type PredictionPromptId,
} from '../../../domain/prediction/entities/prediction-prompt';

export type PredictionPromptFixtureParams = {
  id?: PredictionPromptId;
  predictionId?: PredictionId;
  position?: number;
  promptText?: string;
  options?: PredictionOption[];
  timeLimit?: number;
  points?: number;
};

export const createPredictionPromptFixture = (
  params: PredictionPromptFixtureParams = {},
): PredictionPrompt => {
  const promptId = params.id ?? (1 as PredictionPromptId);
  const options = params.options ?? [
    new PredictionOption(1 as PredictionOptionId, promptId, 'Yes', 0, true),
    new PredictionOption(2 as PredictionOptionId, promptId, 'No', 1, false),
  ];

  return new PredictionPrompt(
    promptId,
    params.predictionId ?? (1 as PredictionId),
    params.position ?? 1,
    params.promptText ?? 'Will it happen?',
    options,
    params.timeLimit ?? 20,
    params.points ?? 1000,
  );
};
