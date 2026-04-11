import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { ActionRow } from '../../../../../shared/ui/layout/containers';
import { SupportingText } from '../../../../../shared/ui/layout/typography';

interface PaginationBarProps {
  readonly currentPage: number;
  readonly onPageChange: (page: number) => void;
  readonly totalPages: number;
}

export function PaginationBar({ currentPage, onPageChange, totalPages }: PaginationBarProps) {
  const { t } = usePresentationTranslation();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label={t('dashboard.games.pagination.label')}>
      <ActionRow justify="center">
        <Button
          aria-label={t('dashboard.games.pagination.previous')}
          disabled={currentPage <= 1}
          intent="ghost"
          onClick={() => onPageChange(currentPage - 1)}
          size="sm"
        >
          ‹
        </Button>

        <SupportingText>
          {t('dashboard.games.pagination.pageOf', {
            current: String(currentPage),
            total: String(totalPages),
          })}
        </SupportingText>

        <Button
          aria-label={t('dashboard.games.pagination.next')}
          disabled={currentPage >= totalPages}
          intent="ghost"
          onClick={() => onPageChange(currentPage + 1)}
          size="sm"
        >
          ›
        </Button>
      </ActionRow>
    </nav>
  );
}
