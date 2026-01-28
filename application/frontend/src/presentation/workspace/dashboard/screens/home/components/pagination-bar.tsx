import { usePresentationTranslation } from '../../../../../shared/i18n/use-presentation-translation';
import { Button } from '../../../../../shared/ui/actions/button';
import { uiThemeTokens } from '../../../../../shared/ui/foundation/ui-theme';

interface PaginationBarProps {
  readonly currentPage: number;
  readonly onPageChange: (page: number) => void;
  readonly totalPages: number;
}

const navStyle = {
  alignItems: 'center' as const,
  display: 'flex',
  gap: uiThemeTokens.spacing.xs,
  justifyContent: 'center',
};

const pageInfoStyle = {
  color: uiThemeTokens.color.text.secondary,
  fontSize: '0.85rem',
  minWidth: '5rem',
  textAlign: 'center' as const,
};

export function PaginationBar({ currentPage, onPageChange, totalPages }: PaginationBarProps) {
  const { t } = usePresentationTranslation();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label={t('dashboard.games.pagination.label')} style={navStyle}>
      <Button
        aria-label={t('dashboard.games.pagination.previous')}
        disabled={currentPage <= 1}
        intent="ghost"
        onClick={() => onPageChange(currentPage - 1)}
        size="sm"
      >
        ‹
      </Button>

      <span style={pageInfoStyle}>
        {t('dashboard.games.pagination.pageOf', {
          current: String(currentPage),
          total: String(totalPages),
        })}
      </span>

      <Button
        aria-label={t('dashboard.games.pagination.next')}
        disabled={currentPage >= totalPages}
        intent="ghost"
        onClick={() => onPageChange(currentPage + 1)}
        size="sm"
      >
        ›
      </Button>
    </nav>
  );
}
