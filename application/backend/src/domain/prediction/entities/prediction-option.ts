import type { PredictionPromptId } from './prediction-prompt';

export type PredictionOptionId = number;

export class PredictionOption {
  constructor(
    public readonly id: PredictionOptionId,
    public readonly promptId: PredictionPromptId,
    public readonly text: string | null,
    public readonly position: number,
    public readonly isCorrect: boolean,
  ) {}
}
