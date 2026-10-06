import type { OrganizationId } from '../../../domains/organization/entities/organization';
import { CURATED_THEME_IDS } from '../../../domains/theme/entities/theme-id';
import { CURATED_THEME_PALETTES } from '../../../domains/theme/services/curated-theme-palettes';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { CatalogItemCard } from '../../shared/ui/data/catalog-item-card';
import { ActionRow, ContentStack, ResponsiveGrid } from '../../shared/ui/layout/containers';
import { SubpageHeader } from '../../shared/ui/layout/subpage-header';
import { PrimaryActionLink, SecondaryActionLink } from '../../shared/ui/navigation/links';
import { ThemeLibraryCard } from '../components/theme-library-card';
import { ThemeLibraryResults } from '../components/theme-library-results';
import { ThemePalettePreview } from '../components/theme-palette-preview';
import { useThemeActionPermission } from '../components/theme-permissions-context';
import { ThemeStudioShell } from '../components/theme-studio-shell';
import { useThemeLibrary } from '../hooks/use-theme-library';

export default function ThemeLibraryScreen({ organizationId }: { readonly organizationId: OrganizationId }) {
  const { t } = usePresentationTranslation();
  const library = useThemeLibrary(organizationId, true);
  const createPermission = useThemeActionPermission('create', library.result?.permissions);
  const libraryPath = `/workspace/organizations/${organizationId}/themes`;
  return (
    <ThemeStudioShell>
      <ContentStack gap="xl">
        <SubpageHeader
          kicker={t('theme.management.eyebrow')}
          title={t('theme.management.title')}
          subtitle={t('theme.management.description')}
          actions={
            createPermission.allowed ? (
              <PrimaryActionLink to={`${libraryPath}/new`}>{t('theme.builder.create')}</PrimaryActionLink>
            ) : (
              <Button disabled permission={createPermission.permission} permissionReason={createPermission.reason}>
                {t('theme.builder.create')}
              </Button>
            )
          }
        />
        <ActionRow>
          <SecondaryActionLink to="/workspace/organizations">
            {t('theme.management.backToOrganizations')}
          </SecondaryActionLink>
        </ActionRow>
        <ThemeLibraryResults
          library={library}
          renderTheme={(theme) => <ThemeLibraryCard theme={theme} permissions={library.result?.permissions} />}
        />
        {createPermission.allowed && library.result?.overallCount === 0 && !library.search && (
          <ResponsiveGrid columns={{ base: 1, sm: 2 }}>
            {CURATED_THEME_IDS.map((id) => (
              <CatalogItemCard
                key={id}
                title={t(`theme.names.${id}`)}
                actions={
                  <SecondaryActionLink to={`${libraryPath}/new/${id}`}>
                    {t('theme.studio.createWith', { starter: t(`theme.names.${id}`) })}
                  </SecondaryActionLink>
                }
              >
                <ThemePalettePreview colors={CURATED_THEME_PALETTES[id].colorScales.accent} />
              </CatalogItemCard>
            ))}
          </ResponsiveGrid>
        )}
      </ContentStack>
    </ThemeStudioShell>
  );
}
