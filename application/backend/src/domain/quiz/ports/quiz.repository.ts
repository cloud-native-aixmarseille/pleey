import type { UserId } from '../../auth/entities/user.entity';
import type { OrganizationId } from '../../organization/entities/organization';
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
  create(
    title: string,
    description: string | null,
    createdById: UserId,
    organizationId: OrganizationId,
  ): Promise<Quiz>;

  /**
   * Finds a quiz by ID
   */
  findById(id: QuizId): Promise<Quiz | null>;

  /**
   * Finds all quizzes
   */
  findAll(): Promise<Quiz[]>;

  /**
   * Finds quizzes by organization
   */
  findByOrganization(organizationId: OrganizationId): Promise<Quiz[]>;

  /**
   * Finds quizzes created by a specific user
   */
  findByCreator(userId: UserId): Promise<Quiz[]>;

  /**
   * Deletes a quiz by ID
   */
  delete(id: QuizId): Promise<void>;

  /**
   * Updates a quiz
   */
  update(id: QuizId, title: string, description: string | null): Promise<Quiz>;
}
