export interface PredictionPromptOption {
  readonly id: number;
  readonly text: string | null;
  readonly position: number;
  readonly isCorrect: boolean;
}

export interface PredictionPrompt {
  readonly id: number;
  readonly predictionId: number;
  readonly position: number;
  readonly promptText: string;
  readonly options: readonly PredictionPromptOption[];
  readonly timeLimit: number;
  readonly points: number;
}
