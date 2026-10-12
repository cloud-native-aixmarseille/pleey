import { OrganizationActionDisabledReason } from '../../../../domains/organization/value-objects/organization-permissions';
import { ProjectActionDisabledReason } from '../../../../domains/project/value-objects/project-permissions';
import type { ActionPermission } from '../../../../domains/shared/value-objects/action-permission';
import { usePresentationTranslation } from '../../../shared/i18n/use-presentation-translation';

export function useWorkspacePermissionReason() {
  const { t } = usePresentationTranslation();
  return (permission: ActionPermission | undefined): string | null => {
    if (permission?.allowed) return null;
    switch (permission?.reason) {
      case OrganizationActionDisabledReason.NOT_A_MEMBER:
        return t('organization.permissions.membershipRequired');
      case OrganizationActionDisabledReason.INSUFFICIENT_PERMISSIONS:
        return t('organization.permissions.managementRequired');
      case OrganizationActionDisabledReason.CANNOT_REMOVE_LAST_OWNER:
        return t('organization.permissions.lastOwner');
      case ProjectActionDisabledReason.CANNOT_DELETE_LAST_PROJECT:
        return t('project.permissions.lastProject');
      case ProjectActionDisabledReason.UNAVAILABLE:
      default:
        return t('common.permissions.unavailable');
    }
  };
}
