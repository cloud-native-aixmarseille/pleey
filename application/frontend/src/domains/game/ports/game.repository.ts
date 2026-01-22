import type { GameSession } from "../types";

/**
 * Game Repository Interface
 * Defines the contract for game data operations
 * Following Dependency Inversion Principle (SOLID)
 */
export interface GameRepository {
  /**
   * Create a new game session
   * @param token - Authentication token
   * @param quizId - Quiz identifier
   */
  createSession(token: string, quizId: number): Promise<GameSession>;

  /**
   * Get all active sessions for the authenticated admin
   * @param token - Authentication token
   */
  getActiveSessions(token: string): Promise<GameSession[]>;

  /**
   * Get sessions for a specific quiz
   * @param token - Authentication token
   * @param quizId - Quiz identifier
   */
  getSessionsByQuiz(token: string, quizId: number): Promise<GameSession[]>;

  /**
   * Stop (pause) an active game session
   * @param token - Authentication token
   * @param sessionId - Session identifier
   */
  stopSession(token: string, sessionId: number): Promise<GameSession>;

  /**
   * Resume a paused game session
   * @param token - Authentication token
   * @param sessionId - Session identifier
   */
  resumeSession(token: string, sessionId: number): Promise<GameSession>;
}
