import type { OrganizationId } from '../../../domain/organization/entities/organization';
import { Project, type ProjectId } from '../../../domain/project/entities/project';

export type ProjectFixtureParams = {
  id?: ProjectId;
  name?: string;
  description?: string | null;
  organizationId?: OrganizationId;
  createdAt?: Date;
};

export const createProjectFixture = (params: ProjectFixtureParams = {}): Project => {
  return new Project(
    params.id ?? 1,
    params.name ?? 'Default Project',
    params.description ?? null,
    params.organizationId ?? 1,
    params.createdAt ?? new Date(Date.UTC(2025, 0, 1)),
  );
};
