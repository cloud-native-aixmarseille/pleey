import type { PartySettings } from '@pleey/contracts/party';
import type { ProjectId as SharedProjectId } from '@pleey/contracts/project';
import { hasNonBlankProjectName } from '@pleey/contracts/project';
import type { ThemeId } from '@pleey/contracts/theme';
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
