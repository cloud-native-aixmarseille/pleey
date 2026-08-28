import type { PartySettings } from '../../game/party/shared/entities/party-settings';
import type { OrganizationId } from '../../organization/entities/organization';

export type ProjectId = string & {
  readonly __identifierBrand: 'ProjectId';
};

export interface Project {
  readonly id: ProjectId;
  readonly name: string;
  readonly description: string | null;
  readonly organizationId: OrganizationId;
  readonly createdAt: string;
  readonly defaultPartySettings: PartySettings | null;
}
