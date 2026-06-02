import { describe, expect, it } from 'vitest';
import { OrganizationErrorCode } from '../enums/organization-error-code.enum';
import { OrganizationRole } from '../enums/organization-role.enum';
import { OrganizationMembershipPolicy } from './organization-membership-policy';

function createMember(
  overrides: Partial<{
    readonly hasManagementPrivileges: () => boolean;
    readonly isOwner: () => boolean;
    readonly role: OrganizationRole;
  }> = {},
) {
  return {
    hasManagementPrivileges: () => true,
    isOwner: () => false,
    role: OrganizationRole.MEMBER,
    ...overrides,
  } as never;
}

describe('OrganizationMembershipPolicy', () => {
  const policy = new OrganizationMembershipPolicy();

  it('rejects member management when the requesting user lacks management privileges', () => {
    expect(() =>
      policy.assertCanManageMembers(createMember({ hasManagementPrivileges: () => false })),
    ).toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('rejects assigning the owner role when the requester is not an owner', () => {
    expect(() =>
      policy.assertCanAssignRole(createMember({ isOwner: () => false }), OrganizationRole.OWNER),
    ).toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('rejects managing an owner when the requester is not an owner', () => {
    expect(() =>
      policy.assertCanManageMember(
        createMember({ isOwner: () => false }),
        createMember({ isOwner: () => true, role: OrganizationRole.OWNER }),
      ),
    ).toThrow(OrganizationErrorCode.INSUFFICIENT_PERMISSIONS);
  });

  it('rejects shrinking ownership to zero', () => {
    expect(() =>
      policy.assertOwnerCountCanShrink([
        createMember({ isOwner: () => true, role: OrganizationRole.OWNER }),
      ]),
    ).toThrow(OrganizationErrorCode.CANNOT_REMOVE_LAST_OWNER);
  });

  it('allows shrinking ownership when another owner remains', () => {
    expect(() =>
      policy.assertOwnerCountCanShrink([
        createMember({ isOwner: () => true, role: OrganizationRole.OWNER }),
        createMember({ isOwner: () => true, role: OrganizationRole.OWNER }),
      ]),
    ).not.toThrow();
  });
});
