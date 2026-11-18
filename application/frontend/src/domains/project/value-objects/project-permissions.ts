import type { Permissions } from '@pleey/domain/shared/primitives';

export enum ProjectActionDisabledReason {
  UNAVAILABLE = 'PERMISSION_UNAVAILABLE',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  CANNOT_DELETE_LAST_PROJECT = 'CANNOT_DELETE_LAST_PROJECT',
}
export type ProjectPermissions = Permissions<{
  update: ProjectActionDisabledReason;
  delete: ProjectActionDisabledReason;
}>;
