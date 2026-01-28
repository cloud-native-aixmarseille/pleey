import type { PredictionId } from './prediction';
import type { PredictionOption } from './prediction-option';

export type PredictionPromptId = number;

export class PredictionPrompt {
  constructor(
    public readonly id: PredictionPromptId,
    public readonly predictionId: PredictionId,
    public readonly position: number,
    public readonly promptText: string,
    public readonly options: PredictionOption[],
    public readonly timeLimit: number,
    public readonly points: number,
  ) {}

  getCorrectOptions(): PredictionOption[] {
    return this.options.filter((option) => option.isCorrect);
  }
}
