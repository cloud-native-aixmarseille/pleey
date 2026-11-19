import type { GuestId } from '@pleey/domain/identity';
import { PartyPlayerKind } from '@pleey/domain/party';
import type { UserId } from '../../../../identity/entities/user';

export interface AuthenticatedPartyPlayerIdentity {
  readonly kind: PartyPlayerKind.USER;
  readonly userId: UserId;
}

export interface GuestPartyPlayerIdentity {
  readonly kind: PartyPlayerKind.GUEST;
  readonly guestId: GuestId;
}

export type PartyPlayerIdentity = AuthenticatedPartyPlayerIdentity | GuestPartyPlayerIdentity;
