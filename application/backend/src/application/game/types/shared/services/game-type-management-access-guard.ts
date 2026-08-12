import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { NotAMemberError } from '../../../../../domain/organization/errors';
import type { OrganizationMemberRepository } from '../../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../../domain/organization/ports/organization-member.repository';
import type { ProjectId } from '../../../../../domain/project/entities/project';
import { ProjectNotFoundError } from '../../../../../domain/project/errors';
import type { ProjectRepository } from '../../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../../domain/project/ports/project.repository';

@Injectable()
export class GameTypeManagementAccessGuard {
  constructor(
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async assertCanManageProject(projectId: ProjectId, userId: UserId): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError({ projectId });
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(project.organizationId, userId);
    if (!membership) {
      throw new NotAMemberError({
        organizationId: project.organizationId,
        projectId,
        userId,
      });
    }
  }
}
