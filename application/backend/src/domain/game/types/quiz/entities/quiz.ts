import type { GameId, GameTypeId } from '@pleey/domain/game';
import type { ProjectId } from '../../../../project/entities/project';

export type QuizId = GameTypeId;

export class Quiz {
  constructor(
    readonly id: QuizId,
    readonly gameId: GameId,
    readonly projectId: ProjectId,
    readonly title: string,
    readonly description: string | null,
    readonly createdAt: Date,
    readonly questionCount: number,
  ) {}
}
