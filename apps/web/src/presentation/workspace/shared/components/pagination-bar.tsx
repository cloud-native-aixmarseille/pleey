import { Button } from '../../../shared/ui/actions/button';
import { ActionRow } from '../../../shared/ui/layout/containers';
import { SupportingText } from '../../../shared/ui/layout/typography';

export interface PaginationViewModel {
  readonly currentPage: number;
  readonly label: string;
  readonly nextLabel: string;
  readonly onPageChange: (page: number) => void;
  readonly pageOfLabel: string;
  readonly previousLabel: string;
  readonly totalPages: number;
}

export function PaginationBar({
  currentPage,
  label,
  nextLabel,
  onPageChange,
  pageOfLabel,
  previousLabel,
  totalPages,
}: PaginationViewModel) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label={label}>
      <ActionRow justify="center">
        <Button
          aria-label={previousLabel}
          disabled={currentPage <= 1}
          intent="ghost"
          onClick={() => onPageChange(currentPage - 1)}
          size="sm"
        >
          {'<'}
        </Button>

        <SupportingText>{pageOfLabel}</SupportingText>

        <Button
          aria-label={nextLabel}
          disabled={currentPage >= totalPages}
          intent="ghost"
          onClick={() => onPageChange(currentPage + 1)}
          size="sm"
        >
          {'>'}
        </Button>
      </ActionRow>
    </nav>
  );
}
