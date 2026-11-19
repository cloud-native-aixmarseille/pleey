import type { PartySettings } from '@pleey/domain/party';
import type { PaginatedResult } from '@pleey/domain/shared/primitives';
import type { ThemeId } from '@pleey/domain/theme';
import type { OrganizationId } from '../../organization/entities/organization';
import type { Project, ProjectId } from '../entities/project';

export const ProjectRepositoryProvider = Symbol('ProjectRepository');

export interface ProjectDefaultsInput {
  readonly defaultPartySettings: PartySettings | null;
  readonly defaultThemeId?: ThemeId | null;
}

export interface ProjectRepository {
  create(
    organizationId: OrganizationId,
    name: string,
    description: string | null,
    defaults: ProjectDefaultsInput,
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

  update(id: ProjectId, name: string, description: string | null, defaults: ProjectDefaultsInput): Promise<Project>;
}
