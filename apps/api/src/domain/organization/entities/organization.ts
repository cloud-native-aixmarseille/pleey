import type { OrganizationId as SharedOrganizationId } from '@pleey/contracts/organization';
import { hasNonBlankOrganizationName } from '@pleey/contracts/organization';
import type { PartySettings } from '@pleey/contracts/party';
import type { ThemeId } from '@pleey/contracts/theme';

export type OrganizationId = SharedOrganizationId;

/**
 * Organization Domain Entity
 * Represents an organization that owns quizzes and game sessions
 */
export class Organization {
  constructor(
    public readonly id: OrganizationId,
    public readonly name: string,
    public readonly description: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly defaultPartySettings: PartySettings | null = null,
    public readonly defaultThemeId: ThemeId | null = null,
  ) {}

  /**
   * Validates if the organization has a valid name
   */
  hasValidName(): boolean {
    return hasNonBlankOrganizationName(this.name);
  }

  /**
   * Checks if the organization name is unique (business logic)
   */
  isNameUnique(existingNames: string[]): boolean {
    return !existingNames.some((name) => name.toLowerCase() === this.name.toLowerCase());
  }
}
