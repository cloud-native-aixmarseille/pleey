import type { Permissions } from '@pleey/contracts/shared/primitives';
import type { OrganizationErrorCode } from '../../organization/enums/organization-error-code.enum';
import type { ProjectErrorCode } from '../enums/project-error-code.enum';

export type ProjectPermissions = Permissions<{
  update: OrganizationErrorCode;
  delete: OrganizationErrorCode | ProjectErrorCode;
}>;
