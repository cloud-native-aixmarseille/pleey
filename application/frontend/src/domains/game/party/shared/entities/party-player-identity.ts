import type { GuestId } from '@pleey/domain/identity';
import type { UserId } from '../../../../identity/entities/user';

export enum PartyPlayerIdentityKind {
  User = 'user',
  Guest = 'guest',
}

interface AuthenticatedPartyPlayerIdentity {
  readonly kind: PartyPlayerIdentityKind.User;
  readonly userId: UserId;
}

interface GuestPartyPlayerIdentity {
  readonly kind: PartyPlayerIdentityKind.Guest;
  readonly guestId: GuestId;
}

interface GuestPartyJoiningIdentity {
  readonly kind: PartyPlayerIdentityKind.Guest;
  readonly guestId?: GuestId;
}

export type PartyPlayerIdentity = AuthenticatedPartyPlayerIdentity | GuestPartyPlayerIdentity;

export type PartyJoiningPlayerIdentity = AuthenticatedPartyPlayerIdentity | GuestPartyJoiningIdentity;
