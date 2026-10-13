import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationMemberId } from '../../../../domain/organization/entities/organization-member';
import type { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { MemberNotFoundError } from '../../../../domain/organization/errors';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import type { OrganizationMemberWithAccess } from '../dto/organization-access.dto';
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
  ): Promise<OrganizationMemberWithAccess> {
    const memberToUpdate = await this.memberRepository.findById(memberId);
    if (!memberToUpdate) {
      throw new MemberNotFoundError({ memberId });
    }

    return this.memberRepository.withOrganizationLock(memberToUpdate.organizationId, async (members) => {
      const target = await members.findById(memberId);
      const requestingMember = await members.findByOrganizationAndUser(memberToUpdate.organizationId, requestingUserId);
      if (!target || !requestingMember) throw new MemberNotFoundError({ memberId });
      const ownerCount = await members.countOwnersByOrganization(target.organizationId);
      this.organizationMembershipAccess.assertRoleChange(requestingMember, target, role, ownerCount);
      const updated = target.role === role ? target : await members.updateRole(memberId, role);
      const currentRequester = requestingMember.id === updated.id ? updated : requestingMember;
      const currentOwnerCount = await members.countOwnersByOrganization(target.organizationId);
      return this.organizationMembershipAccess.memberAccess(currentRequester, updated, currentOwnerCount);
    });
  }
}
