import type { ActionPermission } from '@pleey/domain/shared/primitives';
import type { OrganizationActionDisabledReason } from '../../organization/value-objects/organization-permissions';

export interface ThemePermissions {
  readonly read: ActionPermission<OrganizationActionDisabledReason>;
  readonly create: ActionPermission<OrganizationActionDisabledReason>;
  readonly update: ActionPermission<OrganizationActionDisabledReason>;
  readonly uploadAsset: ActionPermission<OrganizationActionDisabledReason>;
}
