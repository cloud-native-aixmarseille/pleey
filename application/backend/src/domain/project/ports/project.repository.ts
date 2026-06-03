import type { OrganizationId } from '../../organization/entities/organization';
import type { PaginatedResult } from '../../shared/value-objects/paginated-result';
import type { Project, ProjectId } from '../entities/project';

export const ProjectRepositoryProvider = Symbol('ProjectRepository');

export interface ProjectRepository {
  create(
    organizationId: OrganizationId,
    name: string,
    description: string | null,
  ): Promise<Project>;

  findById(id: ProjectId): Promise<Project | null>;

  countByOrganization(organizationId: OrganizationId): Promise<number>;

  findPageByOrganization(
    organizationId: OrganizationId,
    page: number,
    pageSize: number,
    search?: string,
  ): Promise<PaginatedResult<Project>>;

  delete(id: ProjectId): Promise<void>;

  update(id: ProjectId, name: string, description: string | null): Promise<Project>;
}
