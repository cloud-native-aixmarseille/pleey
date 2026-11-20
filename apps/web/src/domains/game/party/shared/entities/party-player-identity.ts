import type { GuestId } from '@pleey/contracts/identity';
import type { AuthenticatedPartyPlayerIdentity, PartyPlayerKind } from '@pleey/contracts/party';

export type { PartyPlayerIdentity } from '@pleey/contracts/party';

interface GuestPartyJoiningIdentity {
  readonly kind: PartyPlayerKind.GUEST;
  readonly guestId?: GuestId;
}

export type PartyJoiningPlayerIdentity = AuthenticatedPartyPlayerIdentity | GuestPartyJoiningIdentity;
