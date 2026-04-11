import type { GameTypeId } from '../../../../../domains/game/types/shared/game-type';
import type {
  PlayableGameMetadataInput,
  PlayableManagementItem,
  PlayableManagementItemInput,
  PlayableManagementState,
} from '../../../../../domains/game/types/shared/management/playable-management';
import type { ProjectId } from '../../../../../domains/project/entities/project';

export interface PlayableManagementGateway<TItemId extends number = number> {
  createGame(projectId: ProjectId, input: PlayableGameMetadataInput): Promise<GameTypeId>;
  load(gameTypeId: GameTypeId): Promise<PlayableManagementState<TItemId>>;
  updateMetadata(gameTypeId: GameTypeId, input: PlayableGameMetadataInput): Promise<void>;
  deleteGame(gameTypeId: GameTypeId): Promise<void>;
  createItem(
    gameTypeId: GameTypeId,
    input: PlayableManagementItemInput,
  ): Promise<PlayableManagementItem<TItemId>>;
  updateItem(
    itemId: TItemId,
    input: PlayableManagementItemInput,
  ): Promise<PlayableManagementItem<TItemId>>;
  deleteItem(itemId: TItemId): Promise<void>;
}

export type PlayableContentManagementGateway<TItemId extends number = number> = Pick<
  PlayableManagementGateway<TItemId>,
  'load' | 'updateMetadata' | 'deleteGame' | 'createItem' | 'updateItem' | 'deleteItem'
>;
