import { Organization } from '../../domain/organization/entities/organization';

export type OrganizationFixtureParams = {
  id?: number;
  name?: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
};

export const createOrganizationFixture = (params: OrganizationFixtureParams = {}): Organization => {
  const createdAt = params.createdAt ?? new Date(Date.UTC(2025, 0, 1));

  return new Organization(
    params.id ?? 1,
    params.name ?? 'Quiz Org',
    params.description ?? null,
    createdAt,
    params.updatedAt ?? createdAt,
  );
};
