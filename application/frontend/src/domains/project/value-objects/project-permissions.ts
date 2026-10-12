import type { Permissions } from '../../shared/value-objects/action-permission';

export enum ProjectActionDisabledReason {
  UNAVAILABLE = 'PERMISSION_UNAVAILABLE',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  CANNOT_DELETE_LAST_PROJECT = 'CANNOT_DELETE_LAST_PROJECT',
}
export type ProjectPermissions = Permissions<{
  update: ProjectActionDisabledReason;
  delete: ProjectActionDisabledReason;
}>;
