import { createDomainError } from '../../shared/errors/domain-error';
import type { ActionPermission } from '../../shared/value-objects/action-permission';
import type { OrganizationMember } from '../entities/organization-member';
import { ORGANIZATION_ERROR_DEFINITIONS, OrganizationErrorCode } from '../enums/organization-error-code.enum';
import { OrganizationRole } from '../enums/organization-role.enum';
import { CannotRemoveLastOwnerError, InsufficientPermissionsError, NotAMemberError } from '../errors';
import type { OrganizationMemberPermissions, OrganizationPermissions } from '../value-objects/organization-permissions';

export const OrganizationMembershipPolicyProvider = Symbol('OrganizationMembershipPolicy');

type Membership = Pick<OrganizationMember, 'organizationId' | 'role' | 'hasManagementPrivileges' | 'isOwner'>;

export class OrganizationMembershipPolicy {
  read(member: Membership | null): ActionPermission<OrganizationErrorCode> {
    return member ? { allowed: true, reason: null } : { allowed: false, reason: OrganizationErrorCode.NOT_A_MEMBER };
  }

  manage(member: Membership | null): ActionPermission<OrganizationErrorCode> {
    const read = this.read(member);
    if (!read.allowed) return read;
    return member?.hasManagementPrivileges()
      ? { allowed: true, reason: null }
      : { allowed: false, reason: OrganizationErrorCode.INSUFFICIENT_PERMISSIONS };
  }

  assignRole(member: Membership | null, role: OrganizationRole): ActionPermission<OrganizationErrorCode> {
    const management = this.manage(member);
    if (!management.allowed) return management;
    return role === OrganizationRole.OWNER && !member?.isOwner()
      ? { allowed: false, reason: OrganizationErrorCode.INSUFFICIENT_PERMISSIONS }
      : { allowed: true, reason: null };
  }

  manageMember(member: Membership | null, target: Membership): ActionPermission<OrganizationErrorCode> {
    const management = this.manage(member);
    if (!management.allowed) return management;
    if (member?.organizationId !== target.organizationId || (target.isOwner() && !member?.isOwner())) {
      return { allowed: false, reason: OrganizationErrorCode.INSUFFICIENT_PERMISSIONS };
    }
    return { allowed: true, reason: null };
  }

  ownerCountCanShrink(ownerCount: number): ActionPermission<OrganizationErrorCode> {
    return ownerCount > 1
      ? { allowed: true, reason: null }
      : { allowed: false, reason: OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER };
  }

  removeMember(
    member: Membership | null,
    target: Membership,
    ownerCount: number,
  ): ActionPermission<OrganizationErrorCode> {
    const management = this.manageMember(member, target);
    if (!management.allowed) return management;
    return target.isOwner() ? this.ownerCountCanShrink(ownerCount) : management;
  }

  changeRole(
    member: Membership | null,
    target: Membership,
    role: OrganizationRole,
    ownerCount: number,
  ): ActionPermission<OrganizationErrorCode> {
    const management = this.manageMember(member, target);
    if (!management.allowed) return management;
    const assignment = this.assignRole(member, role);
    if (!assignment.allowed) return assignment;
    return target.isOwner() && role !== target.role ? this.ownerCountCanShrink(ownerCount) : assignment;
  }

  organizationPermissions(member: Membership | null): OrganizationPermissions {
    const management = this.manage(member);
    return {
      read: this.read(member),
      update: management,
      createProject: management,
      manageMembers: management,
    };
  }

  assignableRoles(member: Membership | null): readonly OrganizationRole[] {
    return Object.values(OrganizationRole).filter((role) => this.assignRole(member, role).allowed);
  }

  memberAccess(
    member: Membership | null,
    target: Membership,
    ownerCount: number,
  ): {
    readonly permissions: OrganizationMemberPermissions;
    readonly assignableRoles: readonly OrganizationRole[];
  } {
    const assignableRoles = Object.values(OrganizationRole).filter(
      (role) => this.changeRole(member, target, role, ownerCount).allowed,
    );
    return {
      permissions: {
        updateRole: assignableRoles.some((role) => role !== target.role)
          ? { allowed: true, reason: null }
          : this.removeMember(member, target, ownerCount),
        remove: this.removeMember(member, target, ownerCount),
      },
      assignableRoles,
    };
  }

  assertCanManageMembers(member: OrganizationMember | null): asserts member is OrganizationMember {
    this.assertAllowed(this.manage(member), { requestingMemberRole: member?.role ?? null });
  }

  assertCanAssignRole(member: OrganizationMember, role: OrganizationRole): void {
    this.assertAllowed(this.assignRole(member, role), { requestedRole: role, requestingMemberRole: member.role });
  }

  assertCanManageMember(member: OrganizationMember, target: OrganizationMember): void {
    this.assertAllowed(this.manageMember(member, target), {
      organizationId: target.organizationId,
      requestingMemberRole: member.role,
      targetMemberRole: target.role,
    });
  }

  assertOwnerCountCanShrink(ownerCount: number): void {
    this.assertAllowed(this.ownerCountCanShrink(ownerCount), { ownerCount });
  }

  assertAllowed(permission: ActionPermission<OrganizationErrorCode>, context: Record<string, unknown>): void {
    if (permission.allowed) return;
    switch (permission.reason) {
      case OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER:
        throw new CannotRemoveLastOwnerError(context);
      case OrganizationErrorCode.INSUFFICIENT_PERMISSIONS:
        throw new InsufficientPermissionsError(context);
      case OrganizationErrorCode.NOT_A_MEMBER:
        throw new NotAMemberError(context);
      default:
        throw createDomainError(ORGANIZATION_ERROR_DEFINITIONS[permission.reason], context);
    }
  }
}
