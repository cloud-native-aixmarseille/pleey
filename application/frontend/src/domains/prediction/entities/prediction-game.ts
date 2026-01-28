export interface PredictionGame {
  readonly id: number;
  readonly predictionId: number;
  readonly projectId: number;
  readonly title: string;
  readonly description: string | null;
  readonly promptCount: number;
  readonly createdAt: string;
}
