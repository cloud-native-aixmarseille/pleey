import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { ProjectId } from '../../../../domain/project/entities/project';
import {
  ProjectMigrationTargetInvalidError,
  ProjectMigrationTargetNotFoundError,
  ProjectMigrationTargetRequiredError,
  ProjectNotFoundError,
} from '../../../../domain/project/errors';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';
import { WorkspaceGameManagementPort } from '../../ports/workspace-game-management.port';
import { ProjectPermissionService } from '../services/project-permission-service';

@Injectable()
export class DeleteProjectUseCase {
  constructor(
    private readonly projectPermissions: ProjectPermissionService,
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(WorkspaceGameManagementPort)
    private readonly workspaceGameManagement: WorkspaceGameManagementPort,
  ) {}

  async execute(projectId: ProjectId, requestingUserId: UserId, migrationProjectId?: ProjectId): Promise<void> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new ProjectNotFoundError({ projectId });
    }

    const membership = await this.projectPermissions.requireMembership(project, requestingUserId);
    const projectCount = await this.projectRepository.countByOrganization(project.organizationId);
    const access = this.projectPermissions.projectAccess(project, membership, projectCount);
    this.projectPermissions.assertAllowed(access.permissions.delete, projectId);

    const projectGameCount = await this.workspaceGameManagement.countProjectGames(projectId);

    if (projectGameCount > 0) {
      if (migrationProjectId === undefined || migrationProjectId === null) {
        throw new ProjectMigrationTargetRequiredError({
          projectGameCount,
          projectId,
        });
      }

      if (migrationProjectId === projectId) {
        throw new ProjectMigrationTargetInvalidError({
          migrationProjectId,
          projectId,
        });
      }

      const migrationProject = await this.projectRepository.findById(migrationProjectId);

      if (!migrationProject || migrationProject.organizationId !== project.organizationId) {
        throw new ProjectMigrationTargetNotFoundError({
          migrationProjectId,
          organizationId: project.organizationId,
          projectId,
        });
      }

      await this.workspaceGameManagement.reassignProjectGames(projectId, migrationProjectId);
    }

    await this.projectRepository.delete(projectId);
  }
}
