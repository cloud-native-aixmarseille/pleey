import type { UserId } from '../../auth/entities/user.entity';
import type { QuestionId } from '../../quiz/entities/question';
import type { GameSessionId } from '../entities/game-session';
import type { GuestId } from '../entities/player-state';
import type { Score } from '../entities/score';

export const ScoreRepositoryProvider = Symbol('ScoreRepository');

/**
 * Score Repository Interface (Port)
 * Defines the contract for score data access
 */
export interface ScoreRepository {
  /**
   * Creates a new score entry
   */
  create(data: {
    sessionId: GameSessionId;
    userId?: UserId;
    guestId?: GuestId;
    guestUsername?: string | null;
    questionId: QuestionId;
    points: number;
    answerTime: number | null;
    isCorrect: boolean;
  }): Promise<Score>;

  /**
   * Finds all scores for a session
   */
  findBySessionId(sessionId: GameSessionId): Promise<Score[]>;

  /**
   * Finds all scores for a user in a session
   */
  findBySessionAndUser(sessionId: GameSessionId, userId: UserId): Promise<Score[]>;

  /**
   * Calculates total score for a user in a session
   */
  calculateTotalScore(sessionId: GameSessionId, userId: UserId): Promise<number>;

  /**
   * Gets leaderboard for a session
   */
  getLeaderboard(sessionId: GameSessionId): Promise<
    Array<{
      userId?: UserId;
      guestId?: GuestId;
      username: string;
      totalScore: number;
    }>
  >;
}
