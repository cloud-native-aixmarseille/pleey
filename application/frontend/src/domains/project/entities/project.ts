import type { PartySettings } from '@pleey/domain/party';
import type { ProjectPermissions } from '@pleey/domain/project';
import type { ThemeId } from '@pleey/domain/theme';
import type { OrganizationId } from '../../organization/entities/organization';

export type { ProjectId } from '@pleey/domain/project';

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

import type { ProjectId } from '@pleey/domain/project';
