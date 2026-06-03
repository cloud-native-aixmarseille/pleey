import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { OrganizationId } from '../../../../domain/organization/entities/organization';
import type { OrganizationMember } from '../../../../domain/organization/entities/organization-member';
import { OrganizationErrorCode } from '../../../../domain/organization/enums/organization-error-code.enum';
import { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import {
  OrganizationMembershipPolicy,
  OrganizationMembershipPolicyProvider,
} from '../../../../domain/organization/services/organization-membership-policy';

@Injectable()
export class OrganizationMembershipAccessService {
  constructor(
    @Inject(OrganizationRepositoryProvider)
    private readonly organizationRepository: OrganizationRepository,
    @Inject(OrganizationMemberRepositoryProvider)
    private readonly memberRepository: OrganizationMemberRepository,
    @Inject(OrganizationMembershipPolicyProvider)
    private readonly membershipPolicy: OrganizationMembershipPolicy,
  ) {}

  async assertOrganizationExists(organizationId: OrganizationId): Promise<void> {
    const organization = await this.organizationRepository.findById(organizationId);

    if (!organization) {
      throw new Error(OrganizationErrorCode.ORGANIZATION_NOT_FOUND);
    }
  }

  async requireMembership(
    organizationId: OrganizationId,
    requestingUserId: UserId,
  ): Promise<OrganizationMember> {
    const requestingMember = await this.memberRepository.findByOrganizationAndUser(
      organizationId,
      requestingUserId,
    );

    if (!requestingMember) {
      throw new Error(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
    }

    return requestingMember;
  }

  async requireManager(
    organizationId: OrganizationId,
    requestingUserId: UserId,
  ): Promise<OrganizationMember> {
    const requestingMember = await this.requireMembership(organizationId, requestingUserId);

    this.membershipPolicy.assertCanManageMembers(requestingMember);

    return requestingMember;
  }

  assertCanAssignRole(requestingMember: OrganizationMember, role: OrganizationRole): void {
    this.membershipPolicy.assertCanAssignRole(requestingMember, role);
  }

  assertCanManageMember(
    requestingMember: OrganizationMember,
    targetMember: OrganizationMember,
  ): void {
    this.membershipPolicy.assertCanManageMember(requestingMember, targetMember);
  }

  async assertOwnerCountCanShrink(organizationId: OrganizationId): Promise<void> {
    const ownerCount = await this.memberRepository.countOwnersByOrganization(organizationId);

    this.membershipPolicy.assertOwnerCountCanShrink(ownerCount);
  }
}
