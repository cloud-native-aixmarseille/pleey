import type { DashboardGameListPage } from '../entities/dashboard-game-list-page';
import type { DashboardGameListQuery } from '../entities/dashboard-game-list-query';

export interface DashboardGameRepository {
  getProjectDashboardGames(query: DashboardGameListQuery): Promise<DashboardGameListPage>;
}
