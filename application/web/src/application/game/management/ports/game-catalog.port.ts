import type { DashboardGameListPage } from '../../../../domains/game/management/entities/dashboard-game-list-page';
import type { DashboardGameListQuery } from '../../../../domains/game/management/entities/dashboard-game-list-query';

export interface GameCatalogPort {
  listProjectGames(query: DashboardGameListQuery): Promise<DashboardGameListPage>;
}

export const GameCatalogPortToken = Symbol('GameCatalogPort');
