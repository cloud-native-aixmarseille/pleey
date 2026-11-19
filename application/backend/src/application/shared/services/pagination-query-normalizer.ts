import { Injectable } from '@nestjs/common';
import type { PaginatedResult, PaginationQuery } from '@pleey/domain/shared/primitives';
import { PAGINATION_LIMITS } from '@pleey/domain/shared/primitives';

interface NormalizedPaginationQuery {
  readonly page: number;
  readonly pageSize: number;
  readonly search: string | undefined;
  readonly skip: number;
}

@Injectable()
export class PaginationQueryNormalizer {
  normalizeQuery(query: PaginationQuery): NormalizedPaginationQuery {
    const page = this.normalizeInteger(query.page, PAGINATION_LIMITS.defaultPage, PAGINATION_LIMITS.maxPage);
    const pageSize = this.normalizeInteger(
      query.pageSize,
      PAGINATION_LIMITS.defaultPageSize,
      PAGINATION_LIMITS.maxPageSize,
    );
    return { page, pageSize, search: query.search?.trim() || undefined, skip: (page - 1) * pageSize };
  }

  normalizePage(page: number, pageSize: number, search?: string): NormalizedPaginationQuery {
    return this.normalizeQuery({ page, pageSize, search });
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

  private normalizeInteger(value: number | undefined, fallback: number, maximum: number): number {
    return value === undefined || !Number.isFinite(value)
      ? fallback
      : Math.min(maximum, Math.max(1, Math.trunc(value)));
  }
}
