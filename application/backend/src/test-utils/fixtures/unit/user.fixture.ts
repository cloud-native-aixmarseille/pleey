import { User, type UserId } from '../../../domain/auth/entities/user.entity';
import type { AvatarUri } from '../../../domain/auth/types/avatar-uri';

export type UserFixtureParams = {
  id?: UserId;
  username?: string;
  email?: string;
  password?: string;
  isAdmin?: boolean;
  avatarUri?: AvatarUri | null;
  createdAt?: Date;
  refreshTokenHash?: string | null;
  refreshTokenExpiresAt?: Date | null;
};

export const createUserFixture = (params: UserFixtureParams = {}): User => {
  return new User(
    params.id ?? 1,
    params.username ?? 'alice',
    params.email ?? 'alice@example.com',
    params.password ?? 'hashed-password',
    params.isAdmin ?? false,
    params.avatarUri ?? null,
    params.createdAt ?? new Date(Date.UTC(2025, 0, 1)),
    params.refreshTokenHash ?? null,
    params.refreshTokenExpiresAt ?? null,
  );
};
