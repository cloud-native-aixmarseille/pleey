import type { User } from '../../../domain/identity/entities/user';
import { UserAuthentication } from '../../../domain/identity/entities/user-authentication';
import { createUserFixture } from './user.fixture';

export function createUserAuthenticationFixture(
  params: {
    user?: User;
    password?: string;
    sessionId?: string | null;
    refreshTokenHash?: string | null;
    refreshTokenExpiresAt?: Date | null;
  } = {},
): UserAuthentication {
  return new UserAuthentication(
    params.user ?? createUserFixture(),
    params.password ?? 'hashed-password',
    params.refreshTokenHash ?? null,
    params.refreshTokenExpiresAt ?? null,
    params.sessionId ?? null,
  );
}
