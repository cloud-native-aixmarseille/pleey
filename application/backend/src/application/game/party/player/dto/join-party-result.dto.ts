import type { GameId } from '../../../../../domain/game/entities/game';
import type { PartyPlayer } from '../../../../../domain/game/party/player/entities/party-player';
import type { PartyId, PartyPin } from '../../../../../domain/game/party/shared/entities/party';

export interface JoinPartyResultDto {
  readonly gameId: GameId;
  readonly player: PartyPlayer;
  readonly partyId: PartyId;
  readonly pin: PartyPin;
}
