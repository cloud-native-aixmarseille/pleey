import type { PartySettings } from '@pleey/domain/party';
import type { ProjectId as SharedProjectId } from '@pleey/domain/project';
import { hasNonBlankProjectName } from '@pleey/domain/project';
import type { ThemeId } from '@pleey/domain/theme';
import type { OrganizationId } from '../../organization/entities/organization';

export type ProjectId = SharedProjectId;

export class Project {
  constructor(
    public readonly id: ProjectId,
    public readonly name: string,
    public readonly description: string | null,
    public readonly organizationId: OrganizationId,
    public readonly createdAt: Date,
    public readonly defaultPartySettings: PartySettings | null = null,
    public readonly defaultThemeId: ThemeId | null = null,
  ) {}

  hasValidName(): boolean {
    return hasNonBlankProjectName(this.name);
  }
}
