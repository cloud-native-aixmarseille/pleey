import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../../domain/identity/entities/user';
import type { ProjectId } from '../../../../../domain/project/entities/project';
import { ProjectNotFoundError } from '../../../../../domain/project/errors';
import type { ProjectRepository } from '../../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../../domain/project/ports/project.repository';
import { OrganizationMembershipAccessService } from '../../../../workspace/organizations/services/organization-membership-access.service';

@Injectable()
export class GameTypeManagementAccessGuard {
  constructor(
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    private readonly membershipAccess: OrganizationMembershipAccessService,
  ) {}

  async assertCanManageProject(projectId: ProjectId, userId: UserId): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new ProjectNotFoundError({ projectId });
    }

    const membership = await this.membershipAccess.findMembership(project.organizationId, userId);
    if (!membership) {
      throw new ProjectNotFoundError({
        organizationId: project.organizationId,
        projectId,
        userId,
      });
    }
  }
}
