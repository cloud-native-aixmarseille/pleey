import { createContext, useContext } from 'react';
import { OrganizationActionDisabledReason } from '../../../domains/organization/value-objects/organization-permissions';
import type { ThemePermissions } from '../../../domains/theme/value-objects/theme-permissions';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import type { useThemePermissions } from '../hooks/use-theme-permissions';

export const ThemePermissionsContext = createContext<ReturnType<typeof useThemePermissions> | null>(null);

export function useThemeActionPermission(action: keyof ThemePermissions, projection?: ThemePermissions) {
  const access = useContext(ThemePermissionsContext);
  const { t } = usePresentationTranslation();
  const accessDecision = access?.permissions?.[action];
  const decision = accessDecision?.allowed ? (projection?.[action] ?? accessDecision) : accessDecision;
  return {
    permission: decision,
    allowed: decision?.allowed === true,
    reason:
      decision?.allowed === false
        ? t(
            decision.reason === OrganizationActionDisabledReason.INSUFFICIENT_PERMISSIONS
              ? 'theme.management.accessDenied'
              : 'common.permissions.unavailable',
          )
        : access?.error
          ? t('theme.management.accessFailed')
          : undefined,
    refresh: access?.refresh,
  };
}
