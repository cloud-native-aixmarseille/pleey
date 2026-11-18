import type { GameSortDirection, GameSortField } from '@pleey/domain/game';
import type { ProjectId } from '../../../project/entities/project';
import type { GameType } from '../../types/shared/game-type';

export type DashboardGameSortField = GameSortField;
export type DashboardGameSortDirection = GameSortDirection;

export interface DashboardGameListQuery {
  readonly projectId: ProjectId;
  readonly search: string;
  readonly typeFilter: readonly GameType[];
  readonly sortField: DashboardGameSortField;
  readonly sortDirection: DashboardGameSortDirection;
  readonly page: number;
  readonly pageSize: number;
}
