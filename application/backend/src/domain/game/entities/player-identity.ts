import type { UserId } from '../../auth/entities/user';

export type GuestId = string;

export type PlayerIdentity =
  | {
      userId: UserId;
      guestId?: never;
    }
  | {
      userId?: never;
      guestId: GuestId;
    };
