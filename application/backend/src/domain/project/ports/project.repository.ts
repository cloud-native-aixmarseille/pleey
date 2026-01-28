import type { OrganizationId } from '../../organization/entities/organization';
import type { Project, ProjectId } from '../entities/project';

export const ProjectRepositoryProvider = Symbol('ProjectRepository');

export interface ProjectRepository {
  create(
    organizationId: OrganizationId,
    name: string,
    description: string | null,
  ): Promise<Project>;

  findById(id: ProjectId): Promise<Project | null>;

  findByOrganization(organizationId: OrganizationId): Promise<Project[]>;

  delete(id: ProjectId): Promise<void>;

  update(id: ProjectId, name: string, description: string | null): Promise<Project>;
}
