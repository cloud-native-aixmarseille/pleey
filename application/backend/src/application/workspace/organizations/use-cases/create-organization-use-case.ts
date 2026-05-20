import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { Organization } from '../../../../domain/organization/entities/organization';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { ProjectRepository } from '../../../../domain/project/ports/project.repository';
import { ProjectRepositoryProvider } from '../../../../domain/project/ports/project.repository';
import type { CreateOrganizationDto } from '../dto/create-organization-dto';

const DEFAULT_PROJECT_NAME = 'Default';

/**
 * Use case for creating a new organization
 * The user who creates the organization becomes the owner
 */
@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
    @Inject(ProjectRepositoryProvider)
    private readonly projectRepository: ProjectRepository,
  ) {}

  async execute(dto: CreateOrganizationDto, creatorUserId: UserId): Promise<Organization> {
    // Check if organization name already exists
    const existing = await this.organizationRepository.findByName(dto.name);
    if (existing) {
      throw new Error(OrganizationErrorCode.ORGANIZATION_NAME_ALREADY_EXISTS);
    }

    // Create the organization
    const organization = await this.organizationRepository.create(
      dto.name,
      dto.description || null,
    );

    // Add the creator as owner
    await this.memberRepository.create(organization.id, creatorUserId, OrganizationRole.OWNER);

    await this.projectRepository.create(organization.id, DEFAULT_PROJECT_NAME, null);

    return organization;
  }
}
