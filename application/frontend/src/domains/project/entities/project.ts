import type { OrganizationId } from '../../organization/entities/organization';

export type ProjectId = number & {
  readonly __identifierBrand: 'ProjectId';
};

export interface Project {
  readonly id: ProjectId;
  readonly name: string;
  readonly description: string | null;
  readonly organizationId: OrganizationId;
  readonly createdAt: string;
}
