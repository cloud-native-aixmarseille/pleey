import type { OrganizationPermissionReason } from '@pleey/domain/organization';
import type { ActionPermission } from '@pleey/domain/shared/primitives';

export interface ThemePermissions {
  readonly read: ActionPermission<OrganizationPermissionReason>;
  readonly create: ActionPermission<OrganizationPermissionReason>;
  readonly update: ActionPermission<OrganizationPermissionReason>;
  readonly uploadAsset: ActionPermission<OrganizationPermissionReason>;
}
