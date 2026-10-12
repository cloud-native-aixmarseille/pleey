import type { PartySettings } from '../../game/party/shared/entities/party-settings';
import type { OrganizationPermissions } from '../value-objects/organization-permissions';

export type OrganizationId = string & {
  readonly __identifierBrand: 'OrganizationId';
};

export enum OrganizationRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  MEMBER = 'member',
}

export interface Organization {
  readonly permissions: OrganizationPermissions;
  readonly assignableRoles: readonly OrganizationRole[];

  readonly id: OrganizationId;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly defaultPartySettings: PartySettings | null;
  readonly role: OrganizationRole | null;
}
