import type { PartyPin, PartyPlayerIdentity } from '@pleey/domain/party';

export interface LeavePartyDto {
  readonly pin: PartyPin;
  readonly playerIdentity: PartyPlayerIdentity;
}
