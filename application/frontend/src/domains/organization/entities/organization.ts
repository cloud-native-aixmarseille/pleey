import type { PartySettings } from '../../game/party/shared/entities/party-settings';

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
  readonly role: OrganizationRole | null;
}
