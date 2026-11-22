import type { AuthenticatedPartyPlayerIdentity, PartyPin } from '@pleey/contracts/party';

export interface JoinPartyDto {
  readonly partyPassword?: string;
  readonly pin: PartyPin;
  readonly playerIdentity: AuthenticatedPartyPlayerIdentity;
  readonly username: string;
}
