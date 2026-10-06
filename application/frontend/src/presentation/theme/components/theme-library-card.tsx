import type { ManagedTheme } from '../../../domains/theme/entities/managed-theme';
import { CURATED_THEME_PALETTES } from '../../../domains/theme/services/curated-theme-palettes';
import type { ThemePermissions } from '../../../domains/theme/value-objects/theme-permissions';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { CatalogItemCard } from '../../shared/ui/data/catalog-item-card';
import { SecondaryActionLink } from '../../shared/ui/navigation/links';
import { ThemePalettePreview } from './theme-palette-preview';
import { useThemeActionPermission } from './theme-permissions-context';

export function ThemeLibraryCard({
  theme,
  permissions,
}: {
  readonly theme: ManagedTheme;
  readonly permissions?: ThemePermissions;
}) {
  const { t } = usePresentationTranslation();
  const permission = useThemeActionPermission('update', permissions);
  const palette =
    theme.document.overrides.colorScales?.accent ??
    CURATED_THEME_PALETTES[theme.document.baseThemeId].colorScales.accent;
  return (
    <CatalogItemCard
      title={theme.document.name}
      badge={t(`theme.names.${theme.document.baseThemeId}`)}
      actions={
        permission.allowed ? (
          <SecondaryActionLink
            to={`/workspace/organizations/${theme.organizationId}/themes/${encodeURIComponent(theme.id)}/edit`}
          >
            {t('theme.management.editTheme', { name: theme.document.name })}
          </SecondaryActionLink>
        ) : (
          <Button disabled permission={permission.permission} permissionReason={permission.reason}>
            {t('theme.management.editTheme', { name: theme.document.name })}
          </Button>
        )
      }
    >
      <ThemePalettePreview colors={palette} />
    </CatalogItemCard>
  );
}
