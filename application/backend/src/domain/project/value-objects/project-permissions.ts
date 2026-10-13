import type { OrganizationErrorCode } from '../../organization/enums/organization-error-code.enum';
import type { Permissions } from '../../shared/value-objects/action-permission';
import type { ProjectErrorCode } from '../enums/project-error-code.enum';

export type ProjectPermissions = Permissions<{
  update: OrganizationErrorCode;
  delete: OrganizationErrorCode | ProjectErrorCode;
}>;
