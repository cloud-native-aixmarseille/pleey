import type { GuestId } from '../../../../identity/entities/guest';
import type { UserId } from '../../../../identity/entities/user';
import { PartyPlayerKind } from '../../enums/party-player-kind.enum';

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
