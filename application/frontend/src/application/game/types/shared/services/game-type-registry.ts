import { inject, injectable, multiInject } from 'inversify';
import type { DashboardGameListItem } from '../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { GameType, GameTypeId } from '../../../../../domains/game/types/shared/game-type';
import type { GameTypeCatalog } from '../../../../../domains/game/types/shared/game-type-catalog';
import type {
  PlayableContentImportCreationInput,
  PlayableContentImportCreationResult,
  PlayableGameMetadataInput,
} from '../../../../../domains/game/types/shared/management/playable-management';
import type { ProjectId } from '../../../../../domains/project/entities/project';
import {
  type GameTypeCatalogFactory,
  GameTypeCatalogFactoryToken,
} from '../contracts/game-type-catalog-factory';
import {
  type GameTypeContributor,
  GameTypeContributorToken,
} from '../contracts/game-type-contributor';
import type { PlayableContentImportExampleProvider } from '../contracts/playable-content-import.gateway';
import type { GameTypeCatalogGateway } from '../gateways/game-type-catalog.gateway';
import { GameTypeRegistryErrorCode } from './game-type-registry.error';

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

      if (!contributor) {
        throw new Error(GameTypeRegistryErrorCode.MISSING_GAME_TYPE_CONTRIBUTOR);
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
  ): Promise<GameTypeId> {
    return this.getContributor(type).createGame(projectId, input);
  }

  async createGameFromImport(
    type: GameType,
    projectId: ProjectId,
    input: PlayableContentImportCreationInput,
  ): Promise<PlayableContentImportCreationResult> {
    return this.getContributor(type).createGameFromImport(projectId, input);
  }

  getImportExampleProvider(type: GameType): PlayableContentImportExampleProvider {
    return this.getContributor(type).importExampleProvider;
  }

  resolveManagementRouteByType(type: GameType, gameTypeId: GameTypeId | null): string | null {
    if (gameTypeId === null) {
      return null;
    }

    const descriptor = this.getContributor(type).descriptor;

    if (!descriptor.managementRoutePath) {
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

  private getContributor(type: GameType): GameTypeContributor {
    const contributor = this.createContributorsByType().get(type);

    if (!contributor) {
      throw new Error(GameTypeRegistryErrorCode.MISSING_GAME_TYPE_CONTRIBUTOR);
    }

    return contributor;
  }
}
