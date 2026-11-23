import { OrganizationPermissionReason } from '@pleey/domain/organization';
import { ProjectPermissionReason } from '@pleey/domain/project';
import type { ActionPermission } from '@pleey/domain/shared/primitives';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';

export function useWorkspacePermissionReason() {
  const { t } = usePresentationTranslation();
  return (permission: ActionPermission | undefined): string | null => {
    if (permission?.allowed) return null;
    switch (permission?.reason) {
      case OrganizationPermissionReason.NOT_A_MEMBER:
        return t('organization.permissions.membershipRequired');
      case OrganizationPermissionReason.INSUFFICIENT_PERMISSIONS:
        return t('organization.permissions.managementRequired');
      case OrganizationPermissionReason.CANNOT_REMOVE_LAST_OWNER:
        return t('organization.permissions.lastOwner');
      case ProjectPermissionReason.CANNOT_DELETE_LAST_PROJECT:
        return t('project.permissions.lastProject');
      case ProjectPermissionReason.UNAVAILABLE:
      default:
        return t('common.permissions.unavailable');
    }
  };
}
