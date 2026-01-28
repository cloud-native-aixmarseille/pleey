export type DashboardGameSortField = 'title' | 'createdAt';
export type DashboardGameSortDirection = 'asc' | 'desc';

export interface DashboardGameListQuery {
  readonly projectId: number;
  readonly search: string;
  readonly typeFilter: readonly string[];
  readonly sortField: DashboardGameSortField;
  readonly sortDirection: DashboardGameSortDirection;
  readonly page: number;
  readonly pageSize: number;
}
