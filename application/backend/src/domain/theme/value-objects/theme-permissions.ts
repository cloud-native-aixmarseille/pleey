import type { OrganizationErrorCode } from '../../organization/enums/organization-error-code.enum';
import type { ActionPermission } from '../../shared/value-objects/action-permission';

export interface ThemePermissions {
  readonly read: ActionPermission<OrganizationErrorCode>;
  readonly create: ActionPermission<OrganizationErrorCode>;
  readonly update: ActionPermission<OrganizationErrorCode>;
  readonly uploadAsset: ActionPermission<OrganizationErrorCode>;
}
