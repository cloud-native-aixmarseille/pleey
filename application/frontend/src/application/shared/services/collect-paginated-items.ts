import { createDomainError } from '../../../domains/shared/errors/domain-error';
import { PaginationErrorCode } from '../../../domains/shared/errors/pagination-error-code';
import type { PaginatedResult } from '../../../domains/shared/value-objects/paginated-result';
import { PAGINATION_LIMITS } from '../../../domains/shared/value-objects/pagination-limits';
import type { PaginationQuery } from '../../../domains/shared/value-objects/pagination-query';

/** Explicit complete-content traversal for editors that need the ordered aggregate. */
export async function collectPaginatedItems<TItem>(
  firstPage: PaginatedResult<TItem>,
  loadPage: (query: PaginationQuery) => Promise<PaginatedResult<TItem>>,
): Promise<TItem[]> {
  const items = [...firstPage.items];
  let current = firstPage;
  while (current.page < current.totalPages) {
    if (current.page >= PAGINATION_LIMITS.maxPage || current.items.length === 0) {
      throw createDomainError(
        {
          code: PaginationErrorCode.INCOMPLETE_COLLECTION,
          message: PaginationErrorCode.INCOMPLETE_COLLECTION,
          messageKey: 'shared.errors.incompleteCollection',
        },
        { page: current.page, totalPages: current.totalPages },
      );
    }
    const next = await loadPage({ page: current.page + 1, pageSize: current.pageSize });
    if (next.page !== current.page + 1 || next.pageSize !== current.pageSize || next.items.length === 0) {
      throw createDomainError(
        {
          code: PaginationErrorCode.INCOMPLETE_COLLECTION,
          message: PaginationErrorCode.INCOMPLETE_COLLECTION,
          messageKey: 'shared.errors.incompleteCollection',
        },
        { page: next.page, requestedPage: current.page + 1 },
      );
    }
    items.push(...next.items);
    current = next;
  }
  return items;
}
