import type {
  DashboardGameListItem,
  DashboardGameSummary,
} from '../../../domains/game-catalog/entities/dashboard-game-list-item';
import type { GameTypeDescriptor } from '../../../domains/game-catalog/entities/game-type-catalog';

export interface DashboardGameTypeFacade {
  readonly descriptor: GameTypeDescriptor;

  buildDashboardSummary?(game: Pick<DashboardGameListItem, 'stageCount'>): DashboardGameSummary;
  loadGames?(projectId: number): Promise<DashboardGameListItem[]>;
}
