import { inject, injectable } from 'inversify';
import type { DashboardGameListPage } from '../../../../domains/game-catalog/entities/dashboard-game-list-page';
import type { DashboardGameListQuery } from '../../../../domains/game-catalog/entities/dashboard-game-list-query';
import type { DashboardGameRepository } from '../../../../domains/game-catalog/ports/dashboard-game-repository';
import { GameTypeManagementRegistry } from '../../../game-catalog/services/game-type-management-registry';
import { DASHBOARD_SERVICE_ID } from '../contracts/dashboard-service-id';

@injectable()
export class ListProjectDashboardGamesUseCase {
  constructor(
    @inject(DASHBOARD_SERVICE_ID.dashboardGameRepository)
    private readonly dashboardGameRepository: DashboardGameRepository,
    @inject(GameTypeManagementRegistry)
    private readonly dashboardGameTypeRegistry: GameTypeManagementRegistry,
  ) {}

  async execute(query: DashboardGameListQuery): Promise<DashboardGameListPage> {
    const page = await this.dashboardGameRepository.getProjectDashboardGames(query);

    return {
      ...page,
      items: this.dashboardGameTypeRegistry.enrichGames(page.items),
    };
  }
}
