import type { GameId, GameTypeId } from '@pleey/contracts/game';
import type { ProjectId } from '../../../../project/entities/project';

export type PredictionId = GameTypeId;

export class Prediction {
  constructor(
    readonly id: PredictionId,
    readonly gameId: GameId,
    readonly projectId: ProjectId,
    readonly title: string,
    readonly description: string | null,
    readonly createdAt: Date,
    readonly promptCount: number,
  ) {}
}
