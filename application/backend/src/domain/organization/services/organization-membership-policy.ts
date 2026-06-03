import type { OrganizationMember } from '../entities/organization-member';
import { OrganizationErrorCode } from '../enums/organization-error-code.enum';
import { OrganizationRole } from '../enums/organization-role.enum';

export const OrganizationMembershipPolicyProvider = Symbol('OrganizationMembershipPolicy');

export class OrganizationMembershipPolicy {
  assertCanManageMembers(
    requestingMember: OrganizationMember | null,
  ): asserts requestingMember is OrganizationMember {
    if (!requestingMember?.hasManagementPrivileges()) {
      throw new Error(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
    }
  }

  assertCanAssignRole(requestingMember: OrganizationMember, role: OrganizationRole): void {
    if (role === OrganizationRole.OWNER && !requestingMember.isOwner()) {
      throw new Error(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
    }
  }

  assertCanManageMember(
    requestingMember: OrganizationMember,
    targetMember: OrganizationMember,
  ): void {
    if (targetMember.isOwner() && !requestingMember.isOwner()) {
      throw new Error(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
    }
  }

  assertOwnerCountCanShrink(ownerCount: number): void {
    if (ownerCount <= 1) {
      throw new Error(OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER);
    }
  }
}
