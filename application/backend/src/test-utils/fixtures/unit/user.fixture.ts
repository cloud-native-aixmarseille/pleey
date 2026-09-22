import { User, type UserId } from '../../../domain/identity/entities/user';
import type { Media } from '../../../domain/media/entities/media';
import { backendTestIdentifiers } from '../../branded-identifiers';

export type UserFixtureParams = {
  id?: UserId;
  username?: string;
  email?: string;
  avatar?: Media | null;
  createdAt?: Date;
};

export const createUserFixture = (params: UserFixtureParams = {}): User => {
  return new User(
    params.id ?? backendTestIdentifiers.user(1),
    params.username ?? 'alice',
    params.email ?? 'alice@example.com',
    params.avatar ?? null,
    params.createdAt ?? new Date(Date.UTC(2025, 0, 1)),
  );
};
