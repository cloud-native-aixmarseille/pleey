import {
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import type { OrganizationMemberRepository } from '../../../domain/organization/repositories/organization-member.repository.interface';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/repositories/organization-member.repository.interface';
import type { OrganizationRepository } from '../../../domain/organization/repositories/organization.repository.interface';
import { OrganizationRepositoryProvider } from '../../../domain/organization/repositories/organization.repository.interface';
import type { AddMemberDto } from '../dto/add-member.dto';
import { OrganizationErrorCode } from '../enums/organization-error-code.enum';
import type { OrganizationMember } from '../../../domain/organization/entities/organization-member.entity';

/**
 * Use case for adding a member to an organization
 * Requires admin privileges in the organization
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
    organizationId: number,
    dto: AddMemberDto,
    requestingUserId: number,
  ): Promise<OrganizationMember> {
    // Verify organization exists
    const organization =
      await this.organizationRepository.findById(organizationId);
    if (!organization) {
      throw new NotFoundException(OrganizationErrorCode.ORGANIZATION_NOT_FOUND);
    }

    // Verify requesting user has permission
    const requestingMember =
      await this.memberRepository.findByOrganizationAndUser(
        organizationId,
        requestingUserId,
      );
    if (!requestingMember || !requestingMember.hasAdminPrivileges()) {
      throw new ForbiddenException(
        OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
      );
    }

    // Check if user is already a member
    const existingMember =
      await this.memberRepository.findByOrganizationAndUser(
        organizationId,
        dto.userId,
      );
    if (existingMember) {
      throw new ConflictException(OrganizationErrorCode.MEMBER_ALREADY_EXISTS);
    }

    // Add the member
    return await this.memberRepository.create(
      organizationId,
      dto.userId,
      dto.role,
    );
  }
}
