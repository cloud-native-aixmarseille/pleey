import type { PartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';
import type { PartyPin } from '../../../../../domain/game/party/shared/entities/party';

export interface LeavePartyDto {
  readonly pin: PartyPin;
  readonly playerIdentity: PartyPlayerIdentity;
}
