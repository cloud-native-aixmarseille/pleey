import { Injectable } from '@nestjs/common';
import type { PaginatedResult } from '../../../domain/shared/value-objects/paginated-result';
import type {
  NormalizedPaginationQuery,
  PaginationQuery,
} from '../../../domain/shared/value-objects/pagination-query';

const DEFAULT_PAGE = 1;

@Injectable()
export class PaginationQueryNormalizer {
  normalizeQuery(
    query: PaginationQuery,
    defaultPageSize: number,
    defaultPage = DEFAULT_PAGE,
  ): NormalizedPaginationQuery {
    return this.create(
      Math.max(defaultPage, query.page ?? defaultPage),
      Math.max(1, query.pageSize ?? defaultPageSize),
      this.normalizeSearchTerm(query.search),
    );
  }

  normalizePage(page: number, pageSize: number, search?: string): NormalizedPaginationQuery {
    return this.create(
      Math.max(DEFAULT_PAGE, page),
      Math.max(1, pageSize),
      this.normalizeSearchTerm(search),
    );
  }

  toPaginatedResult<TItem>(
    query: NormalizedPaginationQuery,
    items: readonly TItem[],
    totalCount: number,
    overallCount = totalCount,
  ): PaginatedResult<TItem> {
    return {
      items,
      totalCount,
      overallCount,
      page: query.page,
      pageSize: query.pageSize,
      totalPages: Math.max(1, Math.ceil(totalCount / query.pageSize)),
    };
  }

  private create(page: number, pageSize: number, search?: string): NormalizedPaginationQuery {
    return {
      page,
      pageSize,
      search,
      skip: (page - 1) * pageSize,
    };
  }

  private normalizeSearchTerm(search: string | undefined): string | undefined {
    const normalizedSearch = search?.trim();

    return normalizedSearch && normalizedSearch.length > 0 ? normalizedSearch : undefined;
  }
}
