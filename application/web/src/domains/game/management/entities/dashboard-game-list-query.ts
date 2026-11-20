import type { GameSortDirection, GameSortField, GameType } from '@pleey/contracts/game';
import type { ProjectId } from '../../../project/entities/project';

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
