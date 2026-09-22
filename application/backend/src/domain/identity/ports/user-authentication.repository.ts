import type { UserId } from '../entities/user';
import type { UserAuthentication } from '../entities/user-authentication';
import type { SessionClientMetadata } from '../types/user-session';

export const UserAuthenticationRepositoryProvider = Symbol('UserAuthenticationRepository');

export interface UserAuthenticationRepository {
  findByEmail(email: string): Promise<UserAuthentication | null>;
  findByRefreshToken(userId: UserId, refreshTokenHash: string): Promise<UserAuthentication | null>;
  saveSession(
    userId: UserId,
    session: {
      sessionId: string;
      refreshTokenHash: string;
      refreshTokenExpiresAt: Date;
      client?: SessionClientMetadata;
    },
    expected: { password?: string; refreshTokenHash?: string },
  ): Promise<boolean>;
  clearSession(userId: UserId, sessionId: string): Promise<void>;
  isSessionActive(userId: UserId, sessionId: string, recordActivity?: boolean): Promise<boolean>;
}
