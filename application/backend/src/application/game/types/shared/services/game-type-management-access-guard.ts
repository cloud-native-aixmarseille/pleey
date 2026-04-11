import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../../domain/identity/entities/user';
import { OrganizationErrorCode } from '../../../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationMemberRepository } from '../../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../../domain/organization/ports/organization-member.repository';
import type { ProjectId } from '../../../../../domain/project/entities/project';
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
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(
      project.organizationId,
      userId,
    );
    if (!membership) {
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
    }
  }
}
