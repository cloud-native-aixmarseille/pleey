import type { GameId } from '@pleey/contracts/game';
import type { PartyId, PartyPin } from '@pleey/contracts/party';
import type { PartyPlayer } from '../../../../../domain/game/party/player/entities/party-player';

export interface JoinPartyResultDto {
  readonly guestCredential?: string;
  readonly gameId: GameId;
  readonly player: PartyPlayer;
  readonly partyId: PartyId;
  readonly pin: PartyPin;
}
