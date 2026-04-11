import type { GuestId } from '../../../../identity/entities/guest';
import type { UserId } from '../../../../identity/entities/user';
import { type PartyPlayerIdentity, PartyPlayerIdentityKind } from './party-player-identity';

interface BasePartyPlayer {
  readonly avatarUri: string | null;
  readonly identity: PartyPlayerIdentity;
  readonly joinedAt?: string;
  readonly totalScore: number;
  readonly username: string;
}

export type PartyPlayer =
  | (BasePartyPlayer & {
      readonly identity: {
        readonly kind: PartyPlayerIdentityKind.User;
        readonly userId: UserId;
      };
    })
  | (BasePartyPlayer & {
      readonly identity: {
        readonly kind: PartyPlayerIdentityKind.Guest;
        readonly guestId: GuestId;
      };
    });
