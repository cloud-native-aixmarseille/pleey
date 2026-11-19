export const PAGINATION_LIMITS: {
  readonly defaultPage: 1;
  readonly defaultPageSize: 9;
  readonly maxPage: 10000;
  readonly maxPageSize: 100;
};

export type ActionPermission<Reason extends string = string> =
  | { readonly allowed: true; readonly reason: null }
  | { readonly allowed: false; readonly reason: Reason };

export type Permissions<TActions extends Record<string, string>> = {
  readonly [K in keyof TActions]: ActionPermission<TActions[K]>;
};

export interface PaginatedResult<TItem> {
  readonly items: readonly TItem[];
  readonly totalCount: number;
  readonly overallCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}

export interface PaginationQuery {
  readonly page?: number;
  readonly pageSize?: number;
  readonly search?: string;
}

export function decodeActionPermission<Reason extends string>(
  value: unknown,
  reasons: Readonly<Record<string, Reason>> & { readonly UNAVAILABLE: Reason },
): ActionPermission<Reason>;
