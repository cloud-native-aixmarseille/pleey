import type { OrganizationMember } from '../entities/organization-member';
import { OrganizationRole } from '../enums/organization-role.enum';
import { CannotRemoveLastOwnerError, InsufficientPermissionsError } from '../errors';

export const OrganizationMembershipPolicyProvider = Symbol('OrganizationMembershipPolicy');

export class OrganizationMembershipPolicy {
  assertCanManageMembers(
    requestingMember: OrganizationMember | null,
  ): asserts requestingMember is OrganizationMember {
    if (!requestingMember?.hasManagementPrivileges()) {
      throw new InsufficientPermissionsError({
        reason: 'memberManagementRequiresPrivileges',
        requestingMemberRole: requestingMember?.role ?? null,
      });
    }
  }

  assertCanAssignRole(requestingMember: OrganizationMember, role: OrganizationRole): void {
    if (role === OrganizationRole.OWNER && !requestingMember.isOwner()) {
      throw new InsufficientPermissionsError({
        requestedRole: role,
        requestingMemberRole: requestingMember.role,
      });
    }
  }

  assertCanManageMember(
    requestingMember: OrganizationMember,
    targetMember: OrganizationMember,
  ): void {
    if (targetMember.isOwner() && !requestingMember.isOwner()) {
      throw new InsufficientPermissionsError({
        requestingMemberRole: requestingMember.role,
        targetMemberRole: targetMember.role,
      });
    }
  }

  assertOwnerCountCanShrink(ownerCount: number): void {
    if (ownerCount <= 1) {
      throw new CannotRemoveLastOwnerError({ ownerCount });
    }
  }
}
