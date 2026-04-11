import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { Project } from '../../../../domain/project/entities/project';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';

@Injectable()
export class ListOrganizationProjectsUseCase {
  constructor(
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(organizationId: OrganizationId, userId: UserId): Promise<Project[]> {
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new Error(OrganizationErrorCode.ORGANIZATION_NOT_FOUND);
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(
      organizationId,
      userId,
    );

    if (!membership) {
      throw new Error(OrganizationErrorCode.NOT_A_MEMBER);
    }

    return this.projectRepository.findByOrganization(organizationId);
  }
}
