import { inject, injectable } from 'inversify';
import type { DashboardGameListPage } from '../../../../domains/game/management/entities/dashboard-game-list-page';
import type { DashboardGameListQuery } from '../../../../domains/game/management/entities/dashboard-game-list-query';
import {
  type GameCatalogPort,
  GameCatalogPortToken,
} from '../../../game/management/ports/game-catalog.port';
import { GameTypeRegistry } from '../../../game/types/shared/services/game-type-registry';

@injectable()
export class ListProjectGamesUseCase {
  constructor(
    @inject(GameCatalogPortToken)
    private readonly gameCatalog: GameCatalogPort,
    @inject(GameTypeRegistry)
    private readonly gameTypeRegistry: GameTypeRegistry,
  ) {}

  async execute(query: DashboardGameListQuery): Promise<DashboardGameListPage> {
    const page = await this.gameCatalog.listProjectGames(query);

    return {
      ...page,
      items: this.gameTypeRegistry.enrichGames(page.items),
    };
  }
}
