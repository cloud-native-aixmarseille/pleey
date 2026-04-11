import { OrganizationIdentifier } from '../../../application/workspace/shared/services/identifiers/organization-identifier';
import {
  Organization,
  type OrganizationId,
} from '../../../domain/organization/entities/organization';

const organizationIdentifier = new OrganizationIdentifier();

export type OrganizationFixtureParams = {
  id?: OrganizationId;
  name?: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export const createOrganizationFixture = (params: OrganizationFixtureParams = {}): Organization => {
  return new Organization(
    params.id ?? organizationIdentifier.parse(1),
    params.name ?? 'Arcade Org',
    params.description ?? null,
    params.createdAt ?? new Date(Date.UTC(2025, 0, 1)),
    params.updatedAt ?? new Date(Date.UTC(2025, 0, 1)),
  );
};
