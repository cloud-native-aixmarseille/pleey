import type { OrganizationPermissions } from '@pleey/domain/organization';
import { type OrganizationRole, type OrganizationId as SharedOrganizationId } from '@pleey/domain/organization';
import type { PartySettings } from '../../game/party/shared/entities/party-settings';
import type { ThemeId } from '../../theme/entities/theme-id';
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
