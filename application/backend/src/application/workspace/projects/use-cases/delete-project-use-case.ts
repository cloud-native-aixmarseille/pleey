import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { ProjectId } from '../../../../domain/project/entities/project';
import { ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
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
      throw new Error(ProjectErrorCode.PROJECT_NOT_FOUND);
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(
      project.organizationId,
      requestingUserId,
    );

    if (!membership) {
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
    }

    if (!membership.hasManagementPrivileges()) {
      throw new Error(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    const organizationProjectCount = await this.projectRepository.countByOrganization(
      project.organizationId,
    );

    if (organizationProjectCount <= 1) {
      throw new Error(ProjectErrorCode.CANNOT_DELETE_LAST_PROJECT);
    }

    const projectGameCount = await this.workspaceGameManagement.countProjectGames(projectId);

    if (projectGameCount > 0) {
      if (migrationProjectId === undefined || migrationProjectId === null) {
        throw new Error(ProjectErrorCode.PROJECT_MIGRATION_TARGET_REQUIRED);
      }

      if (migrationProjectId === projectId) {
        throw new Error(ProjectErrorCode.PROJECT_MIGRATION_TARGET_INVALID);
      }

      const migrationProject = await this.projectRepository.findById(migrationProjectId);

      if (!migrationProject || migrationProject.organizationId !== project.organizationId) {
        throw new Error(ProjectErrorCode.PROJECT_MIGRATION_TARGET_NOT_FOUND);
      }

      await this.workspaceGameManagement.reassignProjectGames(projectId, migrationProjectId);
    }

    await this.projectRepository.delete(projectId);
  }
}
