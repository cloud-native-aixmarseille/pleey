import type { ManagedTheme } from '../../../domains/theme/entities/managed-theme';
import { usePresentationTranslation } from '../../shared/i18n/use-presentation-translation';
import { Button } from '../../shared/ui/actions/button';
import { StatusBanner } from '../../shared/ui/feedback/status-banner';
import { Input } from '../../shared/ui/forms/input';
import { ContentStack } from '../../shared/ui/layout/containers';
import { SupportingText } from '../../shared/ui/layout/typography';
import { PaginationBar } from '../../workspace/shared/components/pagination-bar';
import type { useThemeLibrary } from '../hooks/use-theme-library';
export function ThemeLibraryResults({
  library,
  onSelect,
}: {
  readonly library: ReturnType<typeof useThemeLibrary>;
  readonly onSelect: (theme: ManagedTheme) => void;
}) {
  const { t } = usePresentationTranslation();
  const totalPages = library.result?.totalPages ?? 0;
  return (
    <ContentStack>
      <Input
        label={t('theme.builder.search')}
        value={library.search}
        onChange={(event) => library.setSearch(event.target.value)}
      />
      <StatusBanner tone="error">{library.error ? t('theme.builder.loadFailed') : null}</StatusBanner>
      {library.error && <Button onClick={library.reload}>{t('theme.builder.reload')}</Button>}
      {library.isLoading && <SupportingText>{t('common.loading')}</SupportingText>}
      {library.result?.items.length === 0 && <SupportingText>{t('theme.builder.empty')}</SupportingText>}
      {library.result?.items.map((theme) => (
        <Button key={theme.id} intent="secondary" onClick={() => onSelect(theme)}>
          {theme.document.name}
        </Button>
      ))}
      <PaginationBar
        currentPage={library.page}
        totalPages={totalPages}
        onPageChange={library.setPage}
        label={t('theme.builder.pagination')}
        nextLabel={t('theme.builder.next')}
        previousLabel={t('theme.builder.previous')}
        pageOfLabel={t('theme.builder.pageOf', { current: String(library.page), total: String(totalPages) })}
      />
    </ContentStack>
  );
}
