import type { GuestId } from '@pleey/domain/identity';
import { PartyPlayerKind } from '@pleey/domain/party';
import type { UserId } from '../../../../identity/entities/user';

interface BasePartyPlayer {
  readonly avatarUri: string | null;
  readonly joinedAt: Date;
  readonly totalScore: number;
  readonly username: string;
}

export type PartyPlayer =
  | (BasePartyPlayer & {
      readonly identity: {
        readonly kind: PartyPlayerKind.USER;
        readonly userId: UserId;
      };
    })
  | (BasePartyPlayer & {
      readonly identity: {
        readonly kind: PartyPlayerKind.GUEST;
        readonly guestId: GuestId;
      };
    });
