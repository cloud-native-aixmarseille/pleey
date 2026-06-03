export interface PaginationQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
}

export interface NormalizedPaginationQuery {
  readonly page: number;
  readonly pageSize: number;
  readonly search: string | undefined;
  readonly skip: number;
}
