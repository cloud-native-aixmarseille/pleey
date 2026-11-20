import type { GameId, GameSortDirection, GameSortField, GameTypeId } from '@pleey/contracts/game';
import type { PaginatedResult } from '@pleey/contracts/shared/primitives';
import type { GamePermissions } from '../../../../domain/game/management/value-objects/game-permissions';
import type { ProjectId } from '../../../../domain/project/entities/project';

export interface ListProjectGamesQuery {
  readonly projectId: ProjectId;
  readonly search?: string;
  readonly types?: readonly string[];
  readonly sortField?: GameSortField;
  readonly sortDirection?: GameSortDirection;
  readonly page?: number;
  readonly pageSize?: number;
}

interface ProjectGameCatalogItem {
  readonly gameId: GameId;
  readonly type: string;
  readonly title: string;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly gameTypeId: GameTypeId | null;
  readonly stageCount: number;
}

interface ProjectGameListItem extends ProjectGameCatalogItem {
  readonly permissions: GamePermissions;
}

export interface ProjectGameCatalogPage extends PaginatedResult<ProjectGameCatalogItem> {}

export interface ProjectGameListPage extends PaginatedResult<ProjectGameListItem> {}

export abstract class GameCatalogPort {
  abstract listProjectGames(query: ListProjectGamesQuery): Promise<ProjectGameCatalogPage>;
}
