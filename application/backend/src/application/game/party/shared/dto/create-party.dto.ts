import type { GameId } from '../../../../../domain/game/entities/game';
import type { PartySettings } from '../../../../../domain/game/party/shared/entities/party-settings';
import type { UserId } from '../../../../../domain/identity/entities/user';

export interface CreatePartyDto {
  readonly gameId: GameId;
  readonly hostUserId: UserId;
  readonly privatePartyPassword?: string;
  readonly settingsOverride?: Partial<PartySettings>;
}
