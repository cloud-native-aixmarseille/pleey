import { OrganizationPermissionReason } from '@pleey/domain/organization';
import type { ActionPermission } from '@pleey/domain/shared/primitives';
import type { ThemePermissions } from '@pleey/domain/theme';
import type { OrganizationMember } from '../../organization/entities/organization-member';

export class ThemePermissionPolicy {
  resolve(member: OrganizationMember): ThemePermissions {
    const management: ActionPermission<OrganizationPermissionReason> = member.hasManagementPrivileges()
      ? { allowed: true, reason: null }
      : { allowed: false, reason: OrganizationPermissionReason.INSUFFICIENT_PERMISSIONS };
    return { read: { allowed: true, reason: null }, create: management, update: management, uploadAsset: management };
  }
}
