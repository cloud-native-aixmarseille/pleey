import type { Permissions } from '@pleey/domain/shared/primitives';
import type { OrganizationErrorCode } from '../enums/organization-error-code.enum';

export type OrganizationPermissions = Permissions<{
  read: OrganizationErrorCode;
  update: OrganizationErrorCode;
  createProject: OrganizationErrorCode;
  manageMembers: OrganizationErrorCode;
}>;

export type OrganizationMemberPermissions = Permissions<{
  updateRole: OrganizationErrorCode;
  remove: OrganizationErrorCode;
}>;
