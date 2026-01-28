import type { GameId } from '../../game/entities/game';

export type QuizId = number;

/**
 * Quiz Domain Entity
 * Represents a quiz in the domain
 */
export class Quiz {
  constructor(
    public readonly id: QuizId,
    public readonly gameId: GameId,
    public readonly createdAt: Date,
    public readonly questionCount: number = 0,
  ) {}
}
