import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { Organization, OrganizationId } from '../../../../domain/organization/entities/organization';
import type { OrganizationMember } from '../../../../domain/organization/entities/organization-member';
import type { OrganizationRole } from '../../../../domain/organization/enums/organization-role.enum';
import { OrganizationNotFoundError } from '../../../../domain/organization/errors';
import type { OrganizationRepository } from '../../../../domain/organization/ports/organization.repository';
import { OrganizationRepositoryProvider } from '../../../../domain/organization/ports/organization.repository';
import type { OrganizationMemberRepository } from '../../../../domain/organization/ports/organization-member.repository';
import { OrganizationMemberRepositoryProvider } from '../../../../domain/organization/ports/organization-member.repository';
import {
  OrganizationMembershipPolicy,
  OrganizationMembershipPolicyProvider,
} from '../../../../domain/organization/services/organization-membership-policy';
import type { OrganizationMemberWithAccess, OrganizationWithAccess } from '../dto/organization-access.dto';

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
      throw new OrganizationNotFoundError({ organizationId });
    }
  }

  async requireMembership(organizationId: OrganizationId, requestingUserId: UserId): Promise<OrganizationMember> {
    const requestingMember = await this.memberRepository.findByOrganizationAndUser(organizationId, requestingUserId);

    if (!requestingMember) {
      throw new OrganizationNotFoundError({
        organizationId,
        reason: 'membershipRequired',
        requestingUserId,
      });
    }

    return requestingMember;
  }

  findMembership(organizationId: OrganizationId, userId: UserId): Promise<OrganizationMember | null> {
    return this.memberRepository.findByOrganizationAndUser(organizationId, userId);
  }

  organizationAccess(organization: Organization, member: OrganizationMember): OrganizationWithAccess {
    return Object.assign(organization, {
      role: member.role,
      permissions: this.membershipPolicy.organizationPermissions(member),
      assignableRoles: this.membershipPolicy.assignableRoles(member),
    });
  }

  memberAccess(
    member: OrganizationMember,
    target: OrganizationMember,
    ownerCount: number,
  ): OrganizationMemberWithAccess {
    return Object.assign(target, this.membershipPolicy.memberAccess(member, target, ownerCount));
  }

  permissions(member: OrganizationMember | null) {
    return this.membershipPolicy.organizationPermissions(member);
  }

  async requireManager(organizationId: OrganizationId, requestingUserId: UserId): Promise<OrganizationMember> {
    const requestingMember = await this.requireMembership(organizationId, requestingUserId);

    this.membershipPolicy.assertCanManageMembers(requestingMember);

    return requestingMember;
  }

  assertRoleChange(
    member: OrganizationMember | null,
    target: OrganizationMember,
    role: OrganizationRole,
    ownerCount: number,
  ): void {
    this.membershipPolicy.assertAllowed(this.membershipPolicy.changeRole(member, target, role, ownerCount), {
      memberId: target.id,
      requestedRole: role,
    });
  }

  assertMemberRemoval(member: OrganizationMember | null, target: OrganizationMember, ownerCount: number): void {
    this.membershipPolicy.assertAllowed(this.membershipPolicy.removeMember(member, target, ownerCount), {
      memberId: target.id,
    });
  }

  assertCanAssignRole(requestingMember: OrganizationMember, role: OrganizationRole): void {
    this.membershipPolicy.assertCanAssignRole(requestingMember, role);
  }

  assertCanManageMember(requestingMember: OrganizationMember, targetMember: OrganizationMember): void {
    this.membershipPolicy.assertCanManageMember(requestingMember, targetMember);
  }

  async assertOwnerCountCanShrink(organizationId: OrganizationId): Promise<void> {
    const ownerCount = await this.memberRepository.countOwnersByOrganization(organizationId);

    this.membershipPolicy.assertOwnerCountCanShrink(ownerCount);
  }
}
