import type { DashboardGameListItem } from './dashboard-game-list-item';

export interface DashboardGameListPage {
  readonly items: readonly DashboardGameListItem[];
  readonly totalCount: number;
  readonly overallCount: number;
  readonly page: number;
  readonly pageSize: number;
  readonly totalPages: number;
}
