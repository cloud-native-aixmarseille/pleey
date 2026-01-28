export interface PredictionPromptOptionInput {
  readonly id?: number;
  readonly text: string | null;
  readonly position: number;
  readonly isCorrect: boolean;
}

export interface CreatePredictionPromptInput {
  readonly predictionId: number;
  readonly position?: number;
  readonly promptText: string;
  readonly options: readonly PredictionPromptOptionInput[];
  readonly timeLimit: number;
  readonly points: number;
}

export interface UpdatePredictionPromptInput {
  readonly predictionId?: number;
  readonly position?: number;
  readonly promptText?: string;
  readonly options?: readonly PredictionPromptOptionInput[];
  readonly timeLimit?: number;
  readonly points?: number;
}
