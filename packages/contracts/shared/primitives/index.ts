export const PAGINATION_LIMITS = {
  defaultPage: 1,
  defaultPageSize: 9,
  maxPage: 10000,
  maxPageSize: 100,
} as const;

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
): ActionPermission<Reason> {
  if (typeof value === 'object' && value !== null && 'allowed' in value && 'reason' in value) {
    if (value.allowed === true && value.reason === null) {
      return { allowed: true, reason: null };
    }
    if (
      value.allowed === false &&
      typeof value.reason === 'string' &&
      Object.values(reasons).includes(value.reason as Reason)
    ) {
      return { allowed: false, reason: value.reason as Reason };
    }
  }
  return { allowed: false, reason: reasons.UNAVAILABLE };
}
