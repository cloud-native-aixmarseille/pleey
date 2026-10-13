import type { OrganizationErrorCode } from '../../organization/enums/organization-error-code.enum';
import type { ActionPermission } from '../../shared/value-objects/action-permission';
import { ProjectErrorCode } from '../enums/project-error-code.enum';
import type { ProjectPermissions } from '../value-objects/project-permissions';

export class ProjectPermissionPolicy {
  resolve(management: ActionPermission<OrganizationErrorCode>, projectCount: number): ProjectPermissions {
    return {
      update: management,
      delete:
        !management.allowed || projectCount > 1
          ? management
          : { allowed: false, reason: ProjectErrorCode.CANNOT_DELETE_LAST_PROJECT },
    };
  }
}
