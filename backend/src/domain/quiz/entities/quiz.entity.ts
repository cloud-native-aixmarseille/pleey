/**
 * Quiz Domain Entity
 * Represents a quiz in the domain
 */
export class Quiz {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly description: string | null,
    public readonly createdById: number,
    public readonly organizationId: number,
    public readonly createdAt: Date,
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
  belongsToOrganization(organizationId: number): boolean {
    return this.organizationId === organizationId;
  }
}
