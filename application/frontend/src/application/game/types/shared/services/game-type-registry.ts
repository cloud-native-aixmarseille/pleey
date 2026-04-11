import { inject, injectable, multiInject } from 'inversify';
import type { DashboardGameListItem } from '../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { GameType, GameTypeId } from '../../../../../domains/game/types/shared/game-type';
import type { GameTypeCatalog } from '../../../../../domains/game/types/shared/game-type-catalog';
import type { PlayableGameMetadataInput } from '../../../../../domains/game/types/shared/management/playable-management';
import type { ProjectId } from '../../../../../domains/project/entities/project';
import {
  type GameTypeCatalogFactory,
  GameTypeCatalogFactoryToken,
} from '../contracts/game-type-catalog-factory';
import {
  type GameTypeContributor,
  GameTypeContributorToken,
} from '../contracts/game-type-contributor';
import type { GameTypeCatalogGateway } from '../gateways/game-type-catalog.gateway';

@injectable()
export class GameTypeRegistry implements GameTypeCatalogGateway {
  constructor(
    @inject(GameTypeCatalogFactoryToken)
    private readonly gameTypeCatalogFactory: GameTypeCatalogFactory,
    @multiInject(GameTypeContributorToken)
    private readonly contributors: readonly GameTypeContributor[],
  ) {}

  listCatalog(): GameTypeCatalog {
    return this.gameTypeCatalogFactory.create(
      this.contributors.map((contributor) => contributor.descriptor),
    );
  }

  enrichGames(items: readonly DashboardGameListItem[]): DashboardGameListItem[] {
    const contributorsByType = this.createContributorsByType();

    return items.map((item) => {
      const contributor = contributorsByType.get(item.type);

      if (!contributor?.buildGameSummary) {
        return item;
      }

      return {
        ...item,
        summary: contributor.buildGameSummary(item),
      };
    });
  }

  resolveManagementRoute(game: Pick<DashboardGameListItem, 'type' | 'gameTypeId'>): string | null {
    return this.resolveManagementRouteByType(game.type, game.gameTypeId);
  }

  async createGame(
    type: GameType,
    projectId: ProjectId,
    input: PlayableGameMetadataInput,
  ): Promise<GameTypeId | null> {
    const contributor = this.createContributorsByType().get(type);

    if (!contributor?.createGame) {
      return null;
    }

    return contributor.createGame(projectId, input);
  }

  resolveManagementRouteByType(type: GameType, gameTypeId: GameTypeId | null): string | null {
    if (gameTypeId === null) {
      return null;
    }

    const descriptor = this.createContributorsByType().get(type)?.descriptor;

    if (!descriptor?.managementRoutePath) {
      return null;
    }

    return `${descriptor.managementRoutePath}/${gameTypeId}`;
  }

  listTypes(): readonly GameType[] {
    return this.contributors.map((contributor) => contributor.descriptor.key);
  }

  private createContributorsByType(): ReadonlyMap<GameType, GameTypeContributor> {
    return new Map(
      this.contributors.map((contributor) => [contributor.descriptor.key, contributor]),
    );
  }
}
