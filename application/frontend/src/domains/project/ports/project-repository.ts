import type { Project } from '../entities/project';

export interface CreateProjectCommand {
  readonly organizationId: number;
  readonly name: string;
  readonly description: string | null;
}

export interface UpdateProjectCommand {
  readonly projectId: number;
  readonly name: string;
  readonly description: string | null;
}

export interface DeleteProjectCommand {
  readonly projectId: number;
  readonly migrationProjectId: number | null;
}

export interface ProjectRepository {
  createProject(command: CreateProjectCommand): Promise<Project>;
  deleteProject(command: DeleteProjectCommand): Promise<void>;
  getProjectsByOrganization(organizationId: number): Promise<Project[]>;
  updateProject(command: UpdateProjectCommand): Promise<Project>;
}
