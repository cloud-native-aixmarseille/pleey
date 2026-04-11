import type { UserId } from '../../../../identity/entities/user';

export interface PartyHost {
  readonly avatarUri: string | null;
  readonly userId: UserId;
  readonly username: string;
}
