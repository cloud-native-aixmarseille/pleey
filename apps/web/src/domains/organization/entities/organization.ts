import type { OrganizationPermissions } from '@pleey/contracts/organization';
import { type OrganizationRole, type OrganizationId as SharedOrganizationId } from '@pleey/contracts/organization';
import type { PartySettings } from '@pleey/contracts/party';
import type { ThemeId } from '@pleey/contracts/theme';
export type OrganizationId = SharedOrganizationId;

export interface Organization {
  readonly permissions: OrganizationPermissions;
  readonly assignableRoles: readonly OrganizationRole[];

  readonly id: OrganizationId;
  readonly name: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly defaultPartySettings: PartySettings | null;
  readonly defaultThemeId: ThemeId | null;
  readonly role: OrganizationRole | null;
}
