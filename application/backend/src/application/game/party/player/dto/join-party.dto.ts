import type { GuestId } from '@pleey/domain/identity';
import type { AuthenticatedPartyPlayerIdentity, PartyPin } from '@pleey/domain/party';
import { PartyPlayerKind } from '@pleey/domain/party';

interface GuestPartyJoiningIdentity {
  readonly kind: PartyPlayerKind.GUEST;
  readonly guestId?: GuestId;
}

type PartyJoiningPlayerIdentity = AuthenticatedPartyPlayerIdentity | GuestPartyJoiningIdentity;

export interface JoinPartyDto {
  readonly guestCredential?: string;
  readonly avatarSeed?: string;
  readonly partyPassword?: string;
  readonly pin: PartyPin;
  readonly playerIdentity: PartyJoiningPlayerIdentity;
  readonly username: string;
}
