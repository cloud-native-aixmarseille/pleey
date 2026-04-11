import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../identity/entities/user';
import type { ProjectRepository } from '../../project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../project/ports/project.repository';
import { OrganizationRole } from '../enums/organization-role.enum';
import type { OrganizationRepository } from '../ports/organization.repository';
import { OrganizationRepositoryProvider } from '../ports/organization.repository';
import type { OrganizationMemberRepository } from '../ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../ports/organization-member.repository';

const DEFAULT_ORGANIZATION_NAME = 'Default';
const DEFAULT_PROJECT_NAME = 'Default';

@Injectable()
export class DefaultWorkspaceService {
  constructor(
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async ensure(userId: UserId): Promise<void> {
    const memberships = await this.memberRepository.findByUser(userId);

    if (memberships.length === 0) {
      const organization = await this.organizationRepository.create(
        DEFAULT_ORGANIZATION_NAME,
        null,
      );

      await this.memberRepository.create(organization.id, userId, OrganizationRole.OWNER);

      await this.projectRepository.create(organization.id, DEFAULT_PROJECT_NAME, null);

      return;
    }

    const primaryOrganizationId = memberships[0].organizationId;
    const projects = await this.projectRepository.findByOrganization(primaryOrganizationId);

    if (projects.length === 0) {
      await this.projectRepository.create(primaryOrganizationId, DEFAULT_PROJECT_NAME, null);
    }
  }
}
