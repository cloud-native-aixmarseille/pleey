import type { GameId } from '../../../../../domain/game/entities/game';
import type { UserId } from '../../../../../domain/identity/entities/user';

export interface CreatePartyDto {
  readonly gameId: GameId;
  readonly hostUserId: UserId;
}
