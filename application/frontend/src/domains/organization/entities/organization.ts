import type { PartySettings } from '../../game/party/shared/entities/party-settings';
import type { ThemeId } from '../../theme/entities/theme-id';

export type OrganizationId = string & {
  readonly __identifierBrand: 'OrganizationId';
};

export enum OrganizationRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  MEMBER = 'member',
}

export interface Organization {
  readonly id: OrganizationId;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly defaultPartySettings: PartySettings | null;
  readonly defaultThemeId: ThemeId | null;
  readonly role: OrganizationRole | null;
}
