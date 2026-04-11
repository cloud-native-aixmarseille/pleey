import type { GameId } from '../../../../domain/game/entities/game';
import type { GameTypeId } from '../../../../domain/game/types/shared/entities/game-type';
import type { ProjectId } from '../../../../domain/project/entities/project';
import type { Permissions } from '../../../../domain/shared/value-objects/action-permission';
import type { PaginatedResult } from '../../../../domain/shared/value-objects/paginated-result';

export enum CreatePartyDisabledReason {
  ACTIVE_PARTY_EXISTS = 'GAME_ALREADY_HAS_ACTIVE_PARTY',
  HOST_HAS_ACTIVE_PARTY = 'ACTIVE_PARTY_EXISTS',
  NO_STAGES_AVAILABLE = 'PARTY_STAGES_NOT_AVAILABLE',
}

export enum LaunchReadinessDisabledReason {
  NO_STAGES_AVAILABLE = 'PARTY_STAGES_NOT_AVAILABLE',
}

export type GamePermissions = Permissions<{
  createParty: CreatePartyDisabledReason;
  launchReadiness: LaunchReadinessDisabledReason;
}>;

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
