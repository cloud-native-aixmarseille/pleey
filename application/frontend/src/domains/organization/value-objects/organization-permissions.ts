import type { ActionPermissionReason, Permissions } from '../../shared/value-objects/action-permission';

export enum OrganizationActionDisabledReason {
  NOT_A_MEMBER = 'NOT_A_MEMBER',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  CANNOT_REMOVE_LAST_OWNER = 'CANNOT_REMOVE_LAST_OWNER',
}

type Reason = OrganizationActionDisabledReason | ActionPermissionReason;
export type OrganizationPermissions = Permissions<{
  read: Reason;
  update: Reason;
  createProject: Reason;
  manageMembers: Reason;
}>;
export type OrganizationMemberPermissions = Permissions<{ updateRole: Reason; remove: Reason }>;
