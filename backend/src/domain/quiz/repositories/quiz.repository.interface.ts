import type { Quiz } from '../entities/quiz.entity';

export const QuizRepositoryProvider = Symbol('QuizRepository');

/**
 * Quiz Repository Interface (Port)
 * Defines the contract for quiz data access
 */
export interface QuizRepository {
  /**
   * Creates a new quiz
   */
  create(title: string, description: string | null, createdById: number): Promise<Quiz>;

  /**
   * Finds a quiz by ID
   */
  findById(id: number): Promise<Quiz | null>;

  /**
   * Finds all quizzes
   */
  findAll(): Promise<Quiz[]>;

  /**
   * Finds quizzes created by a specific user
   */
  findByCreator(userId: number): Promise<Quiz[]>;

  /**
   * Deletes a quiz by ID
   */
  delete(id: number): Promise<void>;

  /**
   * Updates a quiz
   */
  update(id: number, title: string, description: string | null): Promise<Quiz>;
}
