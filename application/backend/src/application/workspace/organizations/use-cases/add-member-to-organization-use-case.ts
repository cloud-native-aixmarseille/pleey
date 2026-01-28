import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import type { OrganizationMember } from '../../../../domain/organization/entities/organization-member';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { AddMemberDto } from '../dto/add-member-dto';

/**
 * Use case for adding a member to an organization
 * Requires management privileges in the organization
 */
@Injectable()
export class AddMemberToOrganizationUseCase {
  constructor(
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(
    organizationId: OrganizationId,
    dto: AddMemberDto,
    requestingUserId: UserId,
  ): Promise<OrganizationMember> {
    // Verify organization exists
    const organization = await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new Error(OrganizationErrorCode.ORGANIZATION_NOT_FOUND);
    }

    // Verify requesting user has permission
    const requestingMember = await this.memberRepository.findByOrganizationAndUser(
      organizationId,
      requestingUserId,
    );
    if (!requestingMember || !requestingMember.hasManagementPrivileges()) {
      throw new Error(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    // Check if user is already a member
    const existingMember = await this.memberRepository.findByOrganizationAndUser(
      organizationId,
      dto.userId,
    );
    if (existingMember) {
      throw new Error(OrganizationErrorCode.MEMBER_ALREADY_EXISTS);
    }

    // Add the member
    return await this.memberRepository.create(organizationId, dto.userId, dto.role);
  }
}
