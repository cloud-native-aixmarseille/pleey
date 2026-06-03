export interface PaginatedResult<TItem> {
  readonly items: readonly TItem[];
  readonly totalCount: number;
  readonly overallCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}
