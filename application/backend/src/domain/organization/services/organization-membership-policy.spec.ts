import { describe, expect, it } from 'vitest';
import { backendTestIdentifiers } from '../../../test-utils/branded-identifiers';
import { createOrganizationMemberFixture } from '../../../test-utils/fixtures/unit/organization-member.fixture';
import { OrganizationErrorCode } from '../enums/organization-error-code.enum';
import { OrganizationRole } from '../enums/organization-role.enum';
import { OrganizationMembershipPolicy } from './organization-membership-policy';

describe('OrganizationMembershipPolicy', () => {
  it.each([
    [null, false, OrganizationErrorCode.NOT_A_MEMBER],
    [OrganizationRole.MEMBER, false, OrganizationErrorCode.INSUFFICIENT_PERMISSIONS],
    [OrganizationRole.MANAGER, true, null],
    [OrganizationRole.OWNER, true, null],
  ] as const)('projects management decisions for %s', (role, allowed, reason) => {
    // Arrange
    const policy = new OrganizationMembershipPolicy();
    const member = role === null ? null : createOrganizationMemberFixture({ role });
    // Act
    const permissions = policy.organizationPermissions(member);
    // Assert
    expect(permissions.update).toEqual({ allowed, reason });
    expect(permissions.createProject).toEqual(permissions.update);
  });

  it('preserves ordinary-member read access', () => {
    // Arrange
    const policy = new OrganizationMembershipPolicy();
    const member = createOrganizationMemberFixture();
    // Act
    const permission = policy.read(member);
    // Assert
    expect(permission).toEqual({ allowed: true, reason: null });
  });

  it('denies an owner managing a target from another organization', () => {
    // Arrange
    const policy = new OrganizationMembershipPolicy();
    const owner = createOrganizationMemberFixture({ role: OrganizationRole.OWNER });
    const target = createOrganizationMemberFixture({ organizationId: backendTestIdentifiers.organization(2) });
    // Act
    const access = policy.memberAccess(owner, target, 2);
    // Assert
    expect(access.permissions.remove).toEqual({
      allowed: false,
      reason: OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    });
    expect(access.assignableRoles).toEqual([]);
  });

  it('denies managers owner assignment and management without exposing owner-count constraints', () => {
    // Arrange
    const policy = new OrganizationMembershipPolicy();
    const manager = createOrganizationMemberFixture({ role: OrganizationRole.MANAGER });
    const owner = createOrganizationMemberFixture({ role: OrganizationRole.OWNER });
    // Act
    const access = policy.memberAccess(manager, owner, 1);
    // Assert
    expect(access.permissions.remove).toEqual({
      allowed: false,
      reason: OrganizationErrorCode.INSUFFICIENT_PERMISSIONS,
    });
    expect(policy.assignableRoles(manager)).toEqual([OrganizationRole.MANAGER, OrganizationRole.MEMBER]);
  });

  it('explains why the last owner cannot be removed or demoted', () => {
    // Arrange
    const policy = new OrganizationMembershipPolicy();
    const owner = createOrganizationMemberFixture({ role: OrganizationRole.OWNER });
    // Act
    const access = policy.memberAccess(owner, owner, 1);
    // Assert
    expect(access).toEqual({
      permissions: {
        updateRole: { allowed: false, reason: OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER },
        remove: { allowed: false, reason: OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER },
      },
      assignableRoles: [OrganizationRole.OWNER],
    });
  });

  it('allows removing an owner when another owner remains', () => {
    // Arrange
    const policy = new OrganizationMembershipPolicy();
    const owner = createOrganizationMemberFixture({ role: OrganizationRole.OWNER });
    // Act
    const permission = policy.removeMember(owner, owner, 2);
    // Assert
    expect(permission).toEqual({ allowed: true, reason: null });
  });

  it('uses the projected denial reason for command rejection', () => {
    // Arrange
    const policy = new OrganizationMembershipPolicy();
    const member = createOrganizationMemberFixture();
    const permission = policy.organizationPermissions(member).manageMembers;
    // Act + Assert
    expect(() => policy.assertCanManageMembers(member)).toThrow(permission.reason ?? 'unexpected allowance');
  });
});
