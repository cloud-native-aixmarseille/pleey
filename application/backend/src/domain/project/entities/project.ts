import type { PartySettings } from '../../game/party/shared/entities/party-settings';
import type { OrganizationId } from '../../organization/entities/organization';

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
  ) {}

  hasValidName(): boolean {
    return this.name.trim().length > 0;
  }
}
