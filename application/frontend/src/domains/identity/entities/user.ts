import type { UserId } from '@pleey/domain/identity';

export type { UserId } from '@pleey/domain/identity';

export interface User {
  readonly id: UserId;
  readonly username: string;
  readonly email: string;
  readonly avatarUri?: string | null;
  readonly createdAt?: string | null;
}
