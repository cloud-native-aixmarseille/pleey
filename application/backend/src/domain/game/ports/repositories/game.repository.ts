import type { ProjectId } from '../../../project/entities/project';
import type { Game, GameId } from '../../entities/game';
import type { GameType } from '../../enums/game-type.enum';

export const GameRepositoryProvider = Symbol('GameRepository');

export interface SearchProjectGamesQuery {
  readonly projectId: ProjectId;
  readonly search?: string;
  readonly types?: readonly GameType[];
  readonly sortField: 'title' | 'createdAt';
  readonly sortDirection: 'asc' | 'desc';
  readonly page: number;
  readonly pageSize: number;
}

interface ProjectDashboardGameRecord {
  readonly id: GameId;
  readonly type: GameType;
  readonly title: string;
  readonly description: string | null;
  readonly createdAt: Date;
  readonly relatedGameId: number | null;
  readonly stageCount: number;
}

export interface SearchProjectGamesResult {
  readonly items: readonly ProjectDashboardGameRecord[];
  readonly totalCount: number;
  readonly overallCount: number;
  readonly page: number;
  readonly pageSize: number;
}

/**
 * Game Repository Interface (Port)
 * Defines the contract for game data access
 */
export interface GameRepository {
  create(
    type: GameType,
    title: string,
    description: string | null,
    projectId: ProjectId,
  ): Promise<Game>;

  findById(id: GameId): Promise<Game | null>;

  findByProject(projectId: ProjectId): Promise<Game[]>;

  searchProjectGames(query: SearchProjectGamesQuery): Promise<SearchProjectGamesResult>;

  reassignProject(sourceProjectId: ProjectId, targetProjectId: ProjectId): Promise<void>;

  delete(id: GameId): Promise<void>;

  update(id: GameId, title: string, description: string | null): Promise<Game>;
}
