import type { ActionPermissionReason, Permissions } from '../../shared/value-objects/action-permission';

export enum ProjectActionDisabledReason {
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  CANNOT_DELETE_LAST_PROJECT = 'CANNOT_DELETE_LAST_PROJECT',
}
export type ProjectPermissions = Permissions<{
  update: ProjectActionDisabledReason | ActionPermissionReason;
  delete: ProjectActionDisabledReason | ActionPermissionReason;
}>;
