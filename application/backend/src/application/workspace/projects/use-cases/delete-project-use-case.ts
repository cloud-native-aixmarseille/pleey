import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import {
  InsufficientPermissionsError,
  NotAMemberError,
} from '../../../../domain/organization/errors';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { ProjectId } from '../../../../domain/project/entities/project';
import {
  CannotDeleteLastProjectError,
  ProjectMigrationTargetInvalidError,
  ProjectMigrationTargetNotFoundError,
  ProjectMigrationTargetRequiredError,
  ProjectNotFoundError,
} from '../../../../domain/project/errors';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';
import { WorkspaceGameManagementPort } from '../../ports/workspace-game-management.port';

@Injectable()
export class DeleteProjectUseCase {
  constructor(
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(WorkspaceGameManagementPort)
    private readonly workspaceGameManagement: WorkspaceGameManagementPort,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(
    projectId: ProjectId,
    requestingUserId: UserId,
    migrationProjectId?: ProjectId,
  ): Promise<void> {
    const project = await this.projectRepository.findById(projectId);

    if (!project) {
      throw new ProjectNotFoundError({ projectId });
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(
      project.organizationId,
      requestingUserId,
    );

    if (!membership) {
      throw new NotAMemberError({
        organizationId: project.organizationId,
        projectId,
        userId: requestingUserId,
      });
    }

    if (!membership.hasManagementPrivileges()) {
      throw new InsufficientPermissionsError({
        organizationId: project.organizationId,
        projectId,
        userId: requestingUserId,
      });
    }

    const organizationProjectCount = await this.projectRepository.countByOrganization(
      project.organizationId,
    );

    if (organizationProjectCount <= 1) {
      throw new CannotDeleteLastProjectError({
        organizationId: project.organizationId,
        organizationProjectCount,
        projectId,
      });
    }

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
