import type { GameId } from '@pleey/domain/game';
import type { PartyId, PartyPin } from '@pleey/domain/party';
import type { PartyPlayer } from '../../../../../domain/game/party/player/entities/party-player';

export interface JoinPartyResultDto {
  readonly guestCredential?: string;
  readonly gameId: GameId;
  readonly player: PartyPlayer;
  readonly partyId: PartyId;
  readonly pin: PartyPin;
}
