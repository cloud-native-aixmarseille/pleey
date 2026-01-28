import type { GameId } from '../../game/entities/game';

export type PredictionId = number;

export class Prediction {
  constructor(
    public readonly id: PredictionId,
    public readonly gameId: GameId,
    public readonly createdAt: Date,
    public readonly promptCount: number = 0,
  ) {}
}
