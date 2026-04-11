import type { PartyPlayerIdentity } from '../../../../../domain/game/party/player/entities/party-player-identity';
import type { PartyId } from '../../../../../domain/game/party/shared/entities/party';
import type { PartyActionId } from '../../../../../domain/game/party/shared/entities/party-action';

export interface SubmitPartyActionDto {
  readonly actionId: PartyActionId;
  readonly partyId: PartyId;
  readonly playerIdentity: PartyPlayerIdentity;
}
