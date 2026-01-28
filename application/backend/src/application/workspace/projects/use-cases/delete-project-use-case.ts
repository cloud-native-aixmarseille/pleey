import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import type { GameRepository } from '../../../../domain/game/ports/repositories/game.repository';
import { GameRepositoryProvider } from '../../../../domain/game/ports/repositories/game.repository';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import { ProjectErrorCode } from '../../../../domain/project/enums/project-error-code.enum';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';

@Injectable()
export class DeleteProjectUseCase {
  constructor(
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(GameRepositoryProvider)
    private readonly gameRepository: GameRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(
    projectId: number,
    requestingUserId: UserId,
    migrationProjectId?: number,
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

    const organizationProjects = await this.projectRepository.findByOrganization(
      project.organizationId,
    );

    if (organizationProjects.length <= 1) {
      throw new Error(ProjectErrorCode.CANNOT_DELETE_LAST_PROJECT);
    }

    const projectGames = await this.gameRepository.findByProject(projectId);

    if (projectGames.length > 0) {
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

      await this.gameRepository.reassignProject(projectId, migrationProjectId);
    }

    await this.projectRepository.delete(projectId);
  }
}
