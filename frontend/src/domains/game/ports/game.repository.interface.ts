import { GameSession } from '../../../shared/types';

/**
 * Game Repository Interface
 * Defines the contract for game data operations
 * Following Dependency Inversion Principle (SOLID)
 */
export interface IGameRepository {
  /**
   * Create a new game session
   * @param token - Authentication token
   * @param quizId - Quiz identifier
   */
  createSession(token: string, quizId: number): Promise<GameSession>;
}
