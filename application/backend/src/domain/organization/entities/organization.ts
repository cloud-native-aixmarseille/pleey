import type { OrganizationId as SharedOrganizationId } from '@pleey/domain/organization';
import { hasNonBlankOrganizationName } from '@pleey/domain/organization';
import type { PartySettings } from '../../game/party/shared/entities/party-settings';
import type { ThemeId } from '../../theme/entities/theme-id';

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
