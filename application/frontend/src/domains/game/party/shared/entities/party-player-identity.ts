import type { GuestId } from '@pleey/domain/identity';
import type { AuthenticatedPartyPlayerIdentity, PartyPlayerKind } from '@pleey/domain/party';

export type { PartyPlayerIdentity } from '@pleey/domain/party';

interface GuestPartyJoiningIdentity {
  readonly kind: PartyPlayerKind.GUEST;
  readonly guestId?: GuestId;
}

export type PartyJoiningPlayerIdentity = AuthenticatedPartyPlayerIdentity | GuestPartyJoiningIdentity;
