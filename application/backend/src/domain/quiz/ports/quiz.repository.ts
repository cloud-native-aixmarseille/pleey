import type { GameId } from '../../game/entities/game';
import type { ProjectId } from '../../project/entities/project';
import type { Quiz, QuizId } from '../entities/quiz';

export const QuizRepositoryProvider = Symbol('QuizRepository');

/**
 * Quiz Repository Interface (Port)
 * Defines the contract for quiz data access
 */
export interface QuizRepository {
  /**
   * Creates a new quiz
   */
  create(gameId: GameId): Promise<Quiz>;

  /**
   * Finds a quiz by ID
   */
  findById(id: QuizId): Promise<Quiz | null>;

  /**
   * Finds a quiz by game ID
   */
  findByGameId(gameId: GameId): Promise<Quiz | null>;

  /**
   * Finds all quizzes
   */
  findAll(): Promise<Quiz[]>;

  /**
   * Finds quizzes by organization
   */
  findByProject(projectId: ProjectId): Promise<Quiz[]>;

  /**
   * Deletes a quiz by ID
   */
  delete(id: QuizId): Promise<void>;
}
