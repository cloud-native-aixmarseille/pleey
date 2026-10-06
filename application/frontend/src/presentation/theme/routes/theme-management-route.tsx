import { type ReactNode, Suspense, useRef } from 'react';
import type { OrganizationId } from '../../../domains/organization/entities/organization';
import { OrganizationActionDisabledReason } from '../../../domains/organization/value-objects/organization-permissions';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { PresentationRedirect, usePresentationParams } from '../../shared/routing/router';
import { Button } from '../../shared/ui/actions/button';
import { StatusBanner } from '../../shared/ui/feedback/status-banner';
import { ContentStack } from '../../shared/ui/layout/containers';
import { SecondaryActionLink } from '../../shared/ui/navigation/links';
import { useWorkspaceDependencies } from '../../workspace/shared/contexts/workspace-dependencies-context';
import { ThemePermissionsContext } from '../components/theme-permissions-context';
import { useThemePermissions } from '../hooks/use-theme-permissions';

interface ThemeManagementRouteProps {
  readonly action: 'create' | 'update';
  readonly children: (organizationId: OrganizationId) => ReactNode;
}

export function ThemeManagementRoute({ children, action }: ThemeManagementRouteProps) {
  const { organizationId: rawOrganizationId } = usePresentationParams<'organizationId'>();
  const { organizationIdentifier } = useWorkspaceDependencies();
  const organizationId = organizationIdentifier.parseOrNull(rawOrganizationId);
  if (!organizationId) return <PresentationRedirect to="/workspace/organizations" />;
  return (
    <ThemeManagementAccess key={`${organizationId}/${action}`} organizationId={organizationId} action={action}>
      {children}
    </ThemeManagementAccess>
  );
}

function ThemeManagementAccess({
  children,
  organizationId,
  action,
}: ThemeManagementRouteProps & { readonly organizationId: OrganizationId }) {
  const { t } = usePresentationTranslation();
  const access = useThemePermissions(organizationId);
  const admitted = useRef(false);
  const permission = access.permissions?.[action];
  if (permission?.allowed) admitted.current = true;
  const loading = <StatusBanner>{t('common.loading')}</StatusBanner>;
  if (admitted.current)
    return (
      <ThemePermissionsContext value={access}>
        {!access.permissions &&
          (access.error ? <StatusBanner tone="error">{t('theme.management.accessFailed')}</StatusBanner> : loading)}
        {access.error && <Button onClick={access.refresh}>{t('theme.builder.reload')}</Button>}
        <Suspense fallback={loading}>{children(organizationId)}</Suspense>
      </ThemePermissionsContext>
    );
  if (!access.permissions && !access.error) return loading;
  return (
    <ContentStack>
      <StatusBanner tone="error">
        {t(
          access.error
            ? 'theme.management.accessFailed'
            : permission?.reason === OrganizationActionDisabledReason.INSUFFICIENT_PERMISSIONS
              ? 'theme.management.accessDenied'
              : 'common.permissions.unavailable',
        )}
      </StatusBanner>
      {access.error && <Button onClick={access.refresh}>{t('theme.builder.reload')}</Button>}
      <SecondaryActionLink to="/workspace/organizations">
        {t('theme.management.backToOrganizations')}
      </SecondaryActionLink>
    </ContentStack>
  );
}
