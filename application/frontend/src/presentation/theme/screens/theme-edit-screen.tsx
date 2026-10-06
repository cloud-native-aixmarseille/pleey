import type { OrganizationId } from '../../../domains/organization/entities/organization';
import type { ThemeId } from '../../../domains/theme/entities/theme-id';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { usePresentationNavigate, usePresentationParams } from '../../shared/routing/router';
import { Button } from '../../shared/ui/actions/button';
import { StatusBanner } from '../../shared/ui/feedback/status-banner';
import { ContentStack } from '../../shared/ui/layout/containers';
import { SecondaryActionLink } from '../../shared/ui/navigation/links';
import { ThemeBuilderForm } from '../components/theme-builder-form';
import { useManagedTheme } from '../hooks/use-managed-theme';

export default function ThemeEditScreen({
  organizationId,
  themeIdentifier,
}: {
  readonly organizationId: OrganizationId;
  readonly themeIdentifier: { parseOrNull(value: unknown): ThemeId | null };
}) {
  const { t } = usePresentationTranslation();
  const params = usePresentationParams<'themeId'>();
  const themeId = themeIdentifier.parseOrNull(params.themeId);
  if (!themeId?.startsWith('custom:'))
    return (
      <ContentStack>
        <StatusBanner tone="error">{t('theme.errors.notFound')}</StatusBanner>
        <SecondaryActionLink to={`/workspace/organizations/${organizationId}/themes`}>
          {t('theme.management.backToLibrary')}
        </SecondaryActionLink>
      </ContentStack>
    );
  return <ThemeEditContent key={`${organizationId}/${themeId}`} organizationId={organizationId} themeId={themeId} />;
}

function ThemeEditContent({
  organizationId,
  themeId,
}: {
  readonly organizationId: OrganizationId;
  readonly themeId: ThemeId;
}) {
  const { t } = usePresentationTranslation();
  const navigate = usePresentationNavigate();
  const { theme, error, reload } = useManagedTheme(organizationId, themeId);
  const libraryPath = `/workspace/organizations/${organizationId}/themes`;
  const backToLibrary = () => navigate(libraryPath);
  return (
    <ContentStack gap="xl">
      {error ? (
        <>
          <StatusBanner tone="error">{t(error)}</StatusBanner>
          <Button onClick={reload}>{t('theme.builder.reload')}</Button>
          <SecondaryActionLink to={libraryPath}>{t('theme.management.backToLibrary')}</SecondaryActionLink>
        </>
      ) : theme ? (
        <ThemeBuilderForm
          theme={theme}
          organizationId={organizationId}
          onCancel={backToLibrary}
          onSaved={(saved) => {
            if (saved.id !== themeId)
              navigate(`${libraryPath}/${encodeURIComponent(saved.id)}/edit`, { replace: true });
          }}
        />
      ) : (
        <StatusBanner>{t('common.loading')}</StatusBanner>
      )}
    </ContentStack>
  );
}
