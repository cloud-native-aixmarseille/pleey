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
    sessionId: number;
    userId: number;
    questionId: number;
    points: number;
    answerTime: number | null;
    isCorrect: boolean;
  }): Promise<Score>;

  /**
   * Finds all scores for a session
   */
  findBySessionId(sessionId: number): Promise<Score[]>;

  /**
   * Finds all scores for a user in a session
   */
  findBySessionAndUser(sessionId: number, userId: number): Promise<Score[]>;

  /**
   * Calculates total score for a user in a session
   */
  calculateTotalScore(sessionId: number, userId: number): Promise<number>;

  /**
   * Gets leaderboard for a session
   */
  getLeaderboard(sessionId: number): Promise<
    Array<{
      userId: number;
      username: string;
      totalScore: number;
    }>
  >;
}
