import type { PartySettings } from '@pleey/contracts/party';
import type { PaginatedResult, PaginationQuery } from '@pleey/contracts/shared/primitives';
import type { ThemeId } from '@pleey/contracts/theme';
import type { OrganizationId } from '../../organization/entities/organization';
import type { Project, ProjectId } from '../entities/project';

export interface ListOrganizationProjectsQuery extends PaginationQuery {
  readonly organizationId: OrganizationId;
}

export interface CreateProjectCommand {
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly description: string | null;
  readonly defaultPartySettings?: PartySettings | null;
  readonly defaultThemeId?: ThemeId | null;
}

export interface UpdateProjectCommand {
  readonly projectId: ProjectId;
  readonly name: string;
  readonly description: string | null;
  readonly defaultPartySettings?: PartySettings | null;
  readonly defaultThemeId?: ThemeId | null;
}

export interface DeleteProjectCommand {
  readonly projectId: ProjectId;
  readonly migrationProjectId: ProjectId | null;
}

export interface ProjectRepository {
  createProject(command: CreateProjectCommand): Promise<Project>;
  deleteProject(command: DeleteProjectCommand): Promise<void>;
  getProjectsByOrganization(query: ListOrganizationProjectsQuery): Promise<PaginatedResult<Project>>;
  updateProject(command: UpdateProjectCommand): Promise<Project>;
}

export const ProjectRepositoryToken = Symbol('ProjectRepository');
