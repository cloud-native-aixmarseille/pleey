import type { PartyPin } from '@pleey/domain/party';
import type { PartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';

export interface LeavePartyDto {
  readonly pin: PartyPin;
  readonly playerIdentity: PartyPlayerIdentity;
}
