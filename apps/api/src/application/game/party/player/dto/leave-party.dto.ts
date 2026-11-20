import type { PartyPin, PartyPlayerIdentity } from '@pleey/contracts/party';

export interface LeavePartyDto {
  readonly pin: PartyPin;
  readonly playerIdentity: PartyPlayerIdentity;
}
