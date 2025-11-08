import type { GameSession } from '../entities/game-session.entity';

export const GameSessionRepositoryProvider = Symbol('GameSessionRepository');

/**
 * GameSession Repository Interface (Port)
 * Defines the contract for game session data access
 */
export interface GameSessionRepository {
  /**
   * Creates a new game session
   */
  create(
    quizId: number,
    adminId: number,
    organizationId: number,
    pin: string,
  ): Promise<GameSession>;

  /**
   * Finds a game session by PIN
   */
  findByPin(pin: string): Promise<GameSession | null>;

  /**
   * Finds a game session by ID
   */
  findById(id: number): Promise<GameSession | null>;

  /**
   * Finds active or paused sessions for a specific admin
   */
  findActiveByAdminId(adminId: number): Promise<GameSession[]>;

  /**
   * Finds the active or paused session for a specific quiz
   */
  findActiveByQuizId(quizId: number): Promise<GameSession | null>;

  /**
   * Finds all sessions for a specific quiz
   */
  findByQuizId(quizId: number): Promise<GameSession[]>;

  /**
   * Finds sessions by organization
   */
  findByOrganization(organizationId: number): Promise<GameSession[]>;

  /**
   * Updates game session status
   */
  updateStatus(id: number, status: string): Promise<GameSession>;

  /**
   * Updates current question
   */
  updateCurrentQuestion(id: number, questionNumber: number): Promise<GameSession>;

  /**
   * Counts active or paused sessions by quiz ID
   */
  countActiveByQuizId(quizId: number): Promise<number>;

  /**
   * Deletes old completed sessions
   */
  deleteOldSessions(olderThanDays: number): Promise<void>;
}
