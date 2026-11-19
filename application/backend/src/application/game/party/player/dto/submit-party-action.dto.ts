import type { PartyActionId, PartyId } from '@pleey/domain/party';
import type { PartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';

export interface SubmitPartyActionDto {
  readonly actionId: PartyActionId;
  readonly partyId: PartyId;
  readonly playerIdentity: PartyPlayerIdentity;
}
