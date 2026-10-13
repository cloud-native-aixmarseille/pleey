import type { PartySettings } from '../../game/party/shared/entities/party-settings';
import type { OrganizationId } from '../../organization/entities/organization';
import type { ThemeId } from '../../theme/entities/theme-id';

export type ProjectId = string & {
  readonly __identifierBrand: 'ProjectId';
};

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
    return this.name.trim().length > 0;
  }
}
