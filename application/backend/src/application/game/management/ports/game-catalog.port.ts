import type { GameId } from '../../../../domain/game/entities/game';
import type { GamePermissions } from '../../../../domain/game/management/value-objects/game-permissions';
import type { GameTypeId } from '../../../../domain/game/types/shared/entities/game-type';
import type { ProjectId } from '../../../../domain/project/entities/project';
import type { PaginatedResult } from '../../../../domain/shared/value-objects/paginated-result';

export interface ListProjectGamesQuery {
  readonly projectId: ProjectId;
  readonly search?: string;
  readonly types?: readonly string[];
  readonly sortField?: 'title' | 'createdAt';
  readonly sortDirection?: 'asc' | 'desc';
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
