import type { PaginationViewModel } from '../../../shared/components/pagination-bar';

interface CreatePaginationViewModelOptions {
  readonly currentPage: number;
  readonly label: string;
  readonly nextLabel: string;
  readonly onPageChange: (page: number) => void;
  readonly pageOfLabel: string;
  readonly previousLabel: string;
  readonly totalPages: number;
}

export function createPaginationViewModel({
  currentPage,
  label,
  nextLabel,
  onPageChange,
  pageOfLabel,
  previousLabel,
  totalPages,
}: CreatePaginationViewModelOptions): PaginationViewModel {
  return {
    currentPage,
    label,
    nextLabel,
    onPageChange,
    pageOfLabel,
    previousLabel,
    totalPages,
  };
}
