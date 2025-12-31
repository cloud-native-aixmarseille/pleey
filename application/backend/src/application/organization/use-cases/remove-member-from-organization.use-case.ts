import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationRole } from '../../../domain/organization/enums/organization-role.enum';
import type { OrganizationMemberRepository } from '../../../domain/organization/repositories/organization-member.repository.interface';
import { OrganizationMemberRepositoryProvider } from '../../../domain/organization/repositories/organization-member.repository.interface';
import { OrganizationErrorCode } from '../enums/organization-error-code.enum';

/**
 * Use case for removing a member from an organization
 * Requires admin privileges, cannot remove the last owner
 */
@Injectable()
export class RemoveMemberFromOrganizationUseCase {
  constructor(
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(memberId: number, requestingUserId: number): Promise<void> {
    // Get the member to remove
    const memberToRemove = await this.memberRepository.findById(memberId);
    if (!memberToRemove) {
      throw new NotFoundException(OrganizationErrorCode.MEMBER_NOT_FOUND);
    }

    // Get requesting user's membership
    const requestingMember = await this.memberRepository.findByOrganizationAndUser(
      memberToRemove.organizationId,
      requestingUserId,
    );
    if (!requestingMember || !requestingMember.hasAdminPrivileges()) {
      throw new ForbiddenException(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    // If removing an owner, check it's not the last one
    if (memberToRemove.role === OrganizationRole.OWNER) {
      const allMembers = await this.memberRepository.findByOrganization(
        memberToRemove.organizationId,
      );
      const ownerCount = allMembers.filter((m) => m.isOwner()).length;
      if (ownerCount <= 1) {
        throw new BadRequestException(OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER);
      }
    }

    // Remove the member
    await this.memberRepository.delete(memberId);
  }
}
