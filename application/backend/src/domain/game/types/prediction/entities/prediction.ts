import type { ProjectId } from '../../../../project/entities/project';
import type { GameId } from '../../../entities/game';
import type { GameTypeId } from '../../shared/entities/game-type';

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
