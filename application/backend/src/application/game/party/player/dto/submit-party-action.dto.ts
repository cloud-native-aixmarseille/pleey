import type { PartyActionId, PartyId, PartyPlayerIdentity } from '@pleey/domain/party';

export interface SubmitPartyActionDto {
  readonly actionId: PartyActionId;
  readonly partyId: PartyId;
  readonly playerIdentity: PartyPlayerIdentity;
}
