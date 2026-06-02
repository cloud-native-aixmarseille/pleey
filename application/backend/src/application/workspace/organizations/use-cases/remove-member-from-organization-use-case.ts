import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationMemberId } from '../../../../domain/organization/entities/organization-member';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMembershipAccessService } from '../services/organization-membership-access.service';

/**
 * Use case for removing a member from an organization
 * Requires management privileges, cannot remove the last owner
 */
@Injectable()
export class RemoveMemberFromOrganizationUseCase {
  constructor(
    private readonly organizationMembershipAccess: OrganizationMembershipAccessService,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(memberId: OrganizationMemberId, requestingUserId: UserId): Promise<void> {
    const memberToRemove = await this.memberRepository.findById(memberId);
    if (!memberToRemove) {
      throw new Error(OrganizationErrorCode.MEMBER_NOT_FOUND);
    }

    const requestingMember = await this.organizationMembershipAccess.requireManager(
      memberToRemove.organizationId,
      requestingUserId,
    );
    this.organizationMembershipAccess.assertCanManageMember(requestingMember, memberToRemove);

    if (memberToRemove.isOwner()) {
      await this.organizationMembershipAccess.assertOwnerCountCanShrink(
        memberToRemove.organizationId,
      );
    }

    await this.memberRepository.delete(memberId);
  }
}
