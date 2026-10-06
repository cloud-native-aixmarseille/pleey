import type { PartySettings } from '../../game/party/shared/entities/party-settings';
import type { OrganizationId } from '../../organization/entities/organization';
import type { ThemeId } from '../../theme/entities/theme-id';
import type { ProjectPermissions } from '../value-objects/project-permissions';

export type ProjectId = string & {
  readonly __identifierBrand: 'ProjectId';
};

export interface Project {
  readonly permissions: ProjectPermissions;

  readonly id: ProjectId;
  readonly name: string;
  readonly description: string | null;
  readonly organizationId: OrganizationId;
  readonly createdAt: string;
  readonly defaultPartySettings: PartySettings | null;
  readonly defaultThemeId: ThemeId | null;
}
