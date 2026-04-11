import type { GuestId } from '../../../../identity/entities/guest';
import type { UserId } from '../../../../identity/entities/user';
import { PartyPlayerKind } from '../../enums/party-player-kind.enum';

export interface AuthenticatedPartyPlayerIdentity {
  readonly kind: PartyPlayerKind.USER;
  readonly userId: UserId;
}

export interface GuestPartyPlayerIdentity {
  readonly kind: PartyPlayerKind.GUEST;
  readonly guestId: GuestId;
}

export type PartyPlayerIdentity = AuthenticatedPartyPlayerIdentity | GuestPartyPlayerIdentity;
