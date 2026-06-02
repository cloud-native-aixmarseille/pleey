import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type {
  OrganizationMember,
  OrganizationMemberId,
} from '../../../../domain/organization/entities/organization-member';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import type { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMembershipAccessService } from '../services/organization-membership-access.service';

@Injectable()
export class UpdateOrganizationMemberRoleUseCase {
  constructor(
    private readonly organizationMembershipAccess: OrganizationMembershipAccessService,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
  ) {}

  async execute(
    memberId: OrganizationMemberId,
    role: OrganizationRole,
    requestingUserId: UserId,
  ): Promise<OrganizationMember> {
    const memberToUpdate = await this.memberRepository.findById(memberId);
    if (!memberToUpdate) {
      throw new Error(OrganizationErrorCode.MEMBER_NOT_FOUND);
    }

    const requestingMember = await this.organizationMembershipAccess.requireManager(
      memberToUpdate.organizationId,
      requestingUserId,
    );
    this.organizationMembershipAccess.assertCanManageMember(requestingMember, memberToUpdate);
    this.organizationMembershipAccess.assertCanAssignRole(requestingMember, role);

    if (memberToUpdate.isOwner() && memberToUpdate.role !== role) {
      await this.organizationMembershipAccess.assertOwnerCountCanShrink(
        memberToUpdate.organizationId,
      );
    }

    if (memberToUpdate.role === role) {
      return memberToUpdate;
    }

    return this.memberRepository.updateRole(memberId, role);
  }
}
