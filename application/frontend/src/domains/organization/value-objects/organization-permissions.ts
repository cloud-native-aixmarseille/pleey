import type { Permissions } from '../../shared/value-objects/action-permission';

export enum OrganizationActionDisabledReason {
  UNAVAILABLE = 'PERMISSION_UNAVAILABLE',
  NOT_A_MEMBER = 'NOT_A_MEMBER',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  CANNOT_REMOVE_LAST_OWNER = 'CANNOT_REMOVE_LAST_OWNER',
}

type Reason = OrganizationActionDisabledReason;
export type OrganizationPermissions = Permissions<{
  read: Reason;
  update: Reason;
  createProject: Reason;
  manageMembers: Reason;
}>;
export type OrganizationMemberPermissions = Permissions<{ updateRole: Reason; remove: Reason }>;
