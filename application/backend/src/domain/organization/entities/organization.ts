/**
 * Organization Domain Entity
 * Represents an organization that owns quizzes and game sessions
 */
export class Organization {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly description: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Validates if the organization has a valid name
   */
  hasValidName(): boolean {
    return this.name.trim().length > 0;
  }

  /**
   * Checks if the organization name is unique (business logic)
   */
  isNameUnique(existingNames: string[]): boolean {
    return !existingNames.some((name) => name.toLowerCase() === this.name.toLowerCase());
  }
}
