import { ConflictException, Inject, Injectable } from '@nestjs/common';
import type { Organization } from '../../../domain/organization/entities/organization';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import type { OrganizationRepository } from '../../../domain/organization/repositories/organization.repository.interface';
import { OrganizationRepositoryProvider } from '../../../domain/organization/repositories/organization.repository.interface';
import type { OrganizationMemberRepository } from '../../../domain/organization/repositories/organization-member.repository.interface';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/repositories/organization-member.repository.interface';
import type { CreateOrganizationDto } from '../dto/create-organization.dto';
import { OrganizationErrorCode } from '../enums/organization-error-code.enum';

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
  ) {}

  async execute(dto: CreateOrganizationDto, creatorUserId: number): Promise<Organization> {
    // Check if organization name already exists
    const existing = await this.organizationRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(OrganizationErrorCode.ORGANIZATION_NAME_ALREADY_EXISTS);
    }

    // Create the organization
    const organization = await this.organizationRepository.create(
      dto.name,
      dto.description || null,
    );

    // Add the creator as owner
    await this.memberRepository.create(organization.id, creatorUserId, OrganizationRole.OWNER);

    return organization;
  }
}
