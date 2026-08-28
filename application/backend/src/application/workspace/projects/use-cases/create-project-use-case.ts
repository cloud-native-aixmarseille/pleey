import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import { InsufficientPermissionsError, OrganizationNotFoundError } from '../../../../domain/organization/errors';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { Project } from '../../../../domain/project/entities/project';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';
import type { CreateProjectDto } from '../dto/create-project-dto';

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(organizationId: OrganizationId, dto: CreateProjectDto, requestingUserId: UserId): Promise<Project> {
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new OrganizationNotFoundError({ organizationId });
    }

    const membership = await this.memberRepository.findByOrganizationAndUser(organizationId, requestingUserId);

    if (!membership?.hasManagementPrivileges()) {
      throw new InsufficientPermissionsError({
        organizationId,
        requestingUserId,
        requestingUserRole: membership?.role ?? null,
      });
    }

    return this.projectRepository.create(organizationId, dto.name, dto.description ?? null, {
      defaultPartySettings: dto.defaultPartySettings ?? null,
    });
  }
}
