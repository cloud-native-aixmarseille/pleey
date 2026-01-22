import type { UserId } from '../../auth/entities/user.entity';
import type { OrganizationId } from '../../organization/entities/organization';

export type QuizId = number;

/**
 * Quiz Domain Entity
 * Represents a quiz in the domain
 */
export class Quiz {
  constructor(
    public readonly id: QuizId,
    public readonly title: string,
    public readonly description: string | null,
    public readonly createdById: UserId,
    public readonly organizationId: OrganizationId,
    public readonly createdAt: Date,
    public readonly questionCount: number = 0,
  ) {}

  /**
   * Validates if the quiz has a valid title
   */
  hasValidTitle(): boolean {
    return this.title.trim().length > 0;
  }

  /**
   * Checks if the quiz belongs to a specific organization
   */
  belongsToOrganization(organizationId: OrganizationId): boolean {
    return this.organizationId === organizationId;
  }
}
