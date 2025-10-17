import type { GameSession } from '../entities/game-session.entity';

/**
 * GameSession Repository Interface (Port)
 * Defines the contract for game session data access
 */
export interface IGameSessionRepository {
  /**
   * Creates a new game session
   */
  create(quizId: number, pin: string): Promise<GameSession>;

  /**
   * Finds a game session by PIN
   */
  findByPin(pin: string): Promise<GameSession | null>;

  /**
   * Finds a game session by ID
   */
  findById(id: number): Promise<GameSession | null>;

  /**
   * Updates game session status
   */
  updateStatus(id: number, status: string): Promise<GameSession>;

  /**
   * Updates current question
   */
  updateCurrentQuestion(id: number, questionNumber: number): Promise<GameSession>;

  /**
   * Deletes old completed sessions
   */
  deleteOldSessions(olderThanDays: number): Promise<void>;
}
