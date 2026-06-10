import type { ProjectId } from '../../../../project/entities/project';
import type { GameId } from '../../../entities/game';
import type { GameTypeId } from '../../shared/entities/game-type';

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
    readonly allowOptionChangeAfterVoting: boolean = false,
    readonly randomizeStageOrder: boolean = false,
    readonly randomizeOptionOrder: boolean = false,
  ) {}
}
