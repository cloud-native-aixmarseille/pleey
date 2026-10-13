import type { OrganizationId } from '../../../domains/organization/entities/organization';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { SecondaryActionLink } from '../../shared/ui/navigation/links';
import { useThemePermissions } from '../hooks/use-theme-permissions';

export function ThemeManagementLink({ organizationId }: { readonly organizationId: OrganizationId }) {
  const { t } = usePresentationTranslation();
  const { permissions } = useThemePermissions(organizationId);
  if (!permissions?.update.allowed) return null;
  return (
    <SecondaryActionLink to={`/workspace/organizations/${organizationId}/themes`}>
      {t('theme.builder.library')}
    </SecondaryActionLink>
  );
}
