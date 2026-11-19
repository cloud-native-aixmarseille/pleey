import type { GameId } from '@pleey/domain/game';
import type { PartyPlayer } from '../../../../../domain/game/party/player/entities/party-player';
import type { PartyId, PartyPin } from '../../../../../domain/game/party/shared/entities/party';

export interface JoinPartyResultDto {
  readonly guestCredential?: string;
  readonly gameId: GameId;
  readonly player: PartyPlayer;
  readonly partyId: PartyId;
  readonly pin: PartyPin;
}
