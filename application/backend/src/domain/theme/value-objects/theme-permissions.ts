import type { OrganizationErrorCode } from '../../organization/enums/organization-error-code.enum';
import type { ActionPermission } from '@pleey/domain/shared/primitives';

export interface ThemePermissions {
  readonly read: ActionPermission<OrganizationErrorCode>;
  readonly create: ActionPermission<OrganizationErrorCode>;
  readonly update: ActionPermission<OrganizationErrorCode>;
  readonly uploadAsset: ActionPermission<OrganizationErrorCode>;
}
