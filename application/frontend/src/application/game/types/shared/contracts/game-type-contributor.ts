import type {
  DashboardGameListItem,
  DashboardGameSummary,
} from '../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { GameTypeId } from '../../../../../domains/game/types/shared/game-type';
import type { GameTypeDescriptor } from '../../../../../domains/game/types/shared/game-type-catalog';
import type { PlayableGameMetadataInput } from '../../../../../domains/game/types/shared/management/playable-management';
import type { ProjectId } from '../../../../../domains/project/entities/project';

export interface GameTypeContributor {
  readonly descriptor: GameTypeDescriptor;
  createGame?(projectId: ProjectId, input: PlayableGameMetadataInput): Promise<GameTypeId>;
  buildGameSummary?(game: DashboardGameListItem): DashboardGameSummary;
}

export const GameTypeContributorToken = Symbol('GameTypeContributor');
