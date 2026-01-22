import type { UserId } from '../../auth/entities/user.entity';
import type { QuestionId } from '../../quiz/entities/question';
import type { GameSessionId } from './game-session';
import type { GuestId } from './player-state';

export type ScoreId = number;

/**
 * Score Domain Entity
 * Represents a player's score for a question
 */
export class Score {
  constructor(
    public readonly id: ScoreId,
    public readonly sessionId: GameSessionId,
    public readonly userId: UserId | undefined,
    public readonly guestId: GuestId | undefined,
    public readonly guestUsername: string | null | undefined,
    public readonly questionId: QuestionId,
    public readonly points: number,
    public readonly answerTime: number | null,
    public readonly isCorrect: boolean,
    public readonly answeredAt: Date,
  ) {}

  /**
   * Calculates if this was a quick answer
   */
  wasQuickAnswer(timeLimit: number): boolean {
    if (!this.answerTime) return false;
    return this.answerTime < timeLimit / 2;
  }
}
