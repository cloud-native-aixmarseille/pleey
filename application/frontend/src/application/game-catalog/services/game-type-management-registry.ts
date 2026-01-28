import { injectable, multiInject } from 'inversify';
import type { DashboardGameListItem } from '../../../domains/game-catalog/entities/dashboard-game-list-item';
import { GameTypeRegistryErrorCode } from '../../../domains/game-catalog/errors/game-type-registry-error-code';
import { DASHBOARD_SERVICE_ID } from '../../workspace/dashboard/contracts/dashboard-service-id';
import type { DashboardGameTypeFacade } from '../contracts/game-type-management-facade';

type DashboardGameLoaderFacade = DashboardGameTypeFacade & {
  loadGames(projectId: number): Promise<DashboardGameListItem[]>;
};

function isDashboardGameTypeCatalogFacade(
  facade: DashboardGameTypeFacade,
): facade is DashboardGameLoaderFacade {
  return typeof facade.loadGames === 'function';
}

function canBuildDashboardSummary(
  facade: DashboardGameTypeFacade,
): facade is DashboardGameTypeFacade & {
  buildDashboardSummary: NonNullable<DashboardGameTypeFacade['buildDashboardSummary']>;
} {
  return typeof facade.buildDashboardSummary === 'function';
}

function getCatalogFacadeOrThrow(
  facadesByType: ReadonlyMap<string, DashboardGameTypeFacade>,
  gameTypeKey: string,
): DashboardGameTypeFacade {
  const facade = facadesByType.get(gameTypeKey);

  if (!facade) {
    throw new Error(GameTypeRegistryErrorCode.CATALOG_FACADE_MISSING);
  }

  return facade;
}

@injectable()
export class GameTypeManagementRegistry {
  constructor(
    @multiInject(DASHBOARD_SERVICE_ID.dashboardGameTypeFacade)
    private readonly facades: readonly DashboardGameTypeFacade[],
  ) {}

  async listGames(projectId: number): Promise<DashboardGameListItem[]> {
    const gamesByType = await Promise.all(
      this.facades
        .filter(isDashboardGameTypeCatalogFacade)
        .map((facade) => facade.loadGames(projectId)),
    );

    return gamesByType
      .flat()
      .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt));
  }

  enrichGames(items: readonly DashboardGameListItem[]): DashboardGameListItem[] {
    const facadesByType = new Map(this.facades.map((facade) => [facade.descriptor.key, facade]));

    return items.map((item) => {
      const facade = getCatalogFacadeOrThrow(facadesByType, item.type);

      if (!canBuildDashboardSummary(facade)) {
        return item;
      }

      return {
        ...item,
        summary: facade.buildDashboardSummary(item),
      };
    });
  }

  resolveManagementRoute(
    game: Pick<DashboardGameListItem, 'type' | 'relatedGameId'>,
  ): string | null {
    const facadesByType = new Map(this.facades.map((facade) => [facade.descriptor.key, facade]));
    const facade = facadesByType.get(game.type);

    if (!facade?.descriptor.managementRoutePath) {
      return null;
    }

    if (game.relatedGameId === null) {
      return null;
    }

    return `${facade.descriptor.managementRoutePath}/${game.relatedGameId}`;
  }

  listTypes(): readonly string[] {
    return this.facades.map((facade) => facade.descriptor.key);
  }
}
