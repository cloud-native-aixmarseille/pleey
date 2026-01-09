import { User } from '../../domain/auth/entities/user.entity';

export type UserFixtureParams = {
  id?: number;
  username?: string;
  email?: string;
  password?: string;
  isAdmin?: boolean;
  avatarUrl?: string | null;
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
    params.avatarUrl ?? null,
    params.createdAt ?? new Date(Date.UTC(2025, 0, 1)),
    params.refreshTokenHash ?? null,
    params.refreshTokenExpiresAt ?? null,
  );
};
