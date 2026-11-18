import type { Permissions } from '../shared/primitives/index.js';

export type OrganizationId = string & {
  readonly __identifierBrand: 'OrganizationId';
};

export type OrganizationMemberId = string & {
  readonly __identifierBrand: 'OrganizationMemberId';
};

export const OrganizationRole: {
  readonly OWNER: 'owner';
  readonly MANAGER: 'manager';
  readonly MEMBER: 'member';
};

export type OrganizationRole = (typeof OrganizationRole)[keyof typeof OrganizationRole];

export const OrganizationPermissionReason: {
  readonly UNAVAILABLE: 'PERMISSION_UNAVAILABLE';
  readonly NOT_A_MEMBER: 'NOT_A_MEMBER';
  readonly INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS';
  readonly CANNOT_REMOVE_LAST_OWNER: 'CANNOT_REMOVE_LAST_OWNER';
};

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

export function hasNonBlankOrganizationName(value: string): boolean;
export function normalizeOrganizationName(value: string): string;
