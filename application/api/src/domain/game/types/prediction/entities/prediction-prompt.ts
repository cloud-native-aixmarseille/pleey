import type {
  SelectableOption,
  PredictionPromptId as SharedPredictionPromptId,
  PredictionSelectableOptionId as SharedPredictionSelectableOptionId,
} from '@pleey/contracts/game';
import type { PredictionId } from './prediction';

export type PredictionPromptId = SharedPredictionPromptId;
export type PredictionSelectableOptionId = SharedPredictionSelectableOptionId;

export class PredictionPrompt {
  constructor(
    readonly id: PredictionPromptId,
    readonly predictionId: PredictionId,
    readonly position: number,
    readonly promptText: string,
    readonly timeLimit: number,
    readonly points: number,
    readonly options: readonly SelectableOption<PredictionSelectableOptionId>[],
  ) {}
}
