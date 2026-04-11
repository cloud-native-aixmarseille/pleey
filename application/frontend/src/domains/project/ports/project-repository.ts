import type { OrganizationId } from '../../organization/entities/organization';
import type { Project, ProjectId } from '../entities/project';

export interface CreateProjectCommand {
  readonly organizationId: OrganizationId;
  readonly name: string;
  readonly description: string | null;
}

export interface UpdateProjectCommand {
  readonly projectId: ProjectId;
  readonly name: string;
  readonly description: string | null;
}

export interface DeleteProjectCommand {
  readonly projectId: ProjectId;
  readonly migrationProjectId: ProjectId | null;
}

export interface ProjectRepository {
  createProject(command: CreateProjectCommand): Promise<Project>;
  deleteProject(command: DeleteProjectCommand): Promise<void>;
  getProjectsByOrganization(organizationId: OrganizationId): Promise<Project[]>;
  updateProject(command: UpdateProjectCommand): Promise<Project>;
}

export const ProjectRepositoryToken = Symbol('ProjectRepository');
