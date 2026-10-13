import type { OrganizationMember } from '../../organization/entities/organization-member';
import { OrganizationErrorCode } from '../../organization/enums/organization-error-code.enum';
import type { ActionPermission } from '../../shared/value-objects/action-permission';
import type { ThemePermissions } from '../value-objects/theme-permissions';

export class ThemePermissionPolicy {
  resolve(member: OrganizationMember): ThemePermissions {
    const management: ActionPermission<OrganizationErrorCode> = member.hasManagementPrivileges()
      ? { allowed: true, reason: null }
      : { allowed: false, reason: OrganizationErrorCode.INSUFFICIENT_PERMISSIONS };
    return { read: { allowed: true, reason: null }, create: management, update: management, uploadAsset: management };
  }
}
