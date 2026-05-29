import type {
  DashboardGameListItem,
  DashboardGameSummary,
} from '../../../../../domains/game/management/entities/dashboard-game-list-item';
import type { GameTypeId } from '../../../../../domains/game/types/shared/game-type';
import type { GameTypeDescriptor } from '../../../../../domains/game/types/shared/game-type-catalog';
import type {
  PlayableContentImportCreationInput,
  PlayableContentImportCreationResult,
  PlayableGameMetadataInput,
} from '../../../../../domains/game/types/shared/management/playable-management';
import type { ProjectId } from '../../../../../domains/project/entities/project';
import type { PlayableContentImportExampleProvider } from './playable-content-import.gateway';

export interface GameTypeContributor {
  readonly descriptor: GameTypeDescriptor;
  readonly importExampleProvider: PlayableContentImportExampleProvider;
  createGame(projectId: ProjectId, input: PlayableGameMetadataInput): Promise<GameTypeId>;
  createGameFromImport(
    projectId: ProjectId,
    input: PlayableContentImportCreationInput,
  ): Promise<PlayableContentImportCreationResult>;
  buildGameSummary(game: DashboardGameListItem): DashboardGameSummary;
}

export const GameTypeContributorToken = Symbol('GameTypeContributor');
