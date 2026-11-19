import type { Permissions } from '../shared/primitives/index.ts';

export type OrganizationId = string & { readonly __identifierBrand: 'OrganizationId' };
export type OrganizationMemberId = string & { readonly __identifierBrand: 'OrganizationMemberId' };

export const OrganizationRole = {
  OWNER: 'owner',
  MANAGER: 'manager',
  MEMBER: 'member',
} as const;
export type OrganizationRole = (typeof OrganizationRole)[keyof typeof OrganizationRole];

export const OrganizationPermissionReason = {
  UNAVAILABLE: 'PERMISSION_UNAVAILABLE',
  NOT_A_MEMBER: 'NOT_A_MEMBER',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  CANNOT_REMOVE_LAST_OWNER: 'CANNOT_REMOVE_LAST_OWNER',
} as const;
export type OrganizationPermissionReason =
  (typeof OrganizationPermissionReason)[keyof typeof OrganizationPermissionReason];

export type OrganizationPermissions = Permissions<{
  read: OrganizationPermissionReason;
  update: OrganizationPermissionReason;
  createProject: OrganizationPermissionReason;
  manageMembers: OrganizationPermissionReason;
}>;

export type OrganizationMemberPermissions = Permissions<{
  updateRole: OrganizationPermissionReason;
  remove: OrganizationPermissionReason;
}>;

export function hasNonBlankOrganizationName(value: string): boolean {
  return value.trim().length > 0;
}

export function normalizeOrganizationName(value: string): string {
  return value.trim();
}
