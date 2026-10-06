import type { OrganizationActionDisabledReason } from '../../organization/value-objects/organization-permissions';
import type { ActionPermission } from '../../shared/value-objects/action-permission';

export interface ThemePermissions {
  readonly read: ActionPermission<OrganizationActionDisabledReason>;
  readonly create: ActionPermission<OrganizationActionDisabledReason>;
  readonly update: ActionPermission<OrganizationActionDisabledReason>;
  readonly uploadAsset: ActionPermission<OrganizationActionDisabledReason>;
}
