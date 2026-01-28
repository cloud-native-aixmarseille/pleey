import { User, type UserId } from '../../../domain/auth/entities/user';
import type { Media } from '../../../domain/media/entities/media';

export type UserFixtureParams = {
  id?: UserId;
  username?: string;
  email?: string;
  password?: string;
  avatar?: Media | null;
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
    params.avatar ?? null,
    params.createdAt ?? new Date(Date.UTC(2025, 0, 1)),
    params.refreshTokenHash ?? null,
    params.refreshTokenExpiresAt ?? null,
  );
};
