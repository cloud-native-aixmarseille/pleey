import type { PartySettings } from '@pleey/contracts/party';
import type { ProjectPermissions } from '@pleey/contracts/project';
import type { ThemeId } from '@pleey/contracts/theme';
import type { OrganizationId } from '../../organization/entities/organization';

export type { ProjectId } from '@pleey/contracts/project';

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

import type { ProjectId } from '@pleey/contracts/project';
