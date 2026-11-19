import type { GuestId } from '@pleey/domain/identity';
import type { PartyPlayerKind } from '@pleey/domain/party';
import type { UserId } from '../../../../identity/entities/user';

interface AuthenticatedPartyPlayerIdentity {
  readonly kind: PartyPlayerKind.USER;
  readonly userId: UserId;
}

interface GuestPartyPlayerIdentity {
  readonly kind: PartyPlayerKind.GUEST;
  readonly guestId: GuestId;
}

interface GuestPartyJoiningIdentity {
  readonly kind: PartyPlayerKind.GUEST;
  readonly guestId?: GuestId;
}

export type PartyPlayerIdentity = AuthenticatedPartyPlayerIdentity | GuestPartyPlayerIdentity;

export type PartyJoiningPlayerIdentity = AuthenticatedPartyPlayerIdentity | GuestPartyJoiningIdentity;
