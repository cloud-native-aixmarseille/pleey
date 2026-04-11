import type { Media } from '../../media/entities/media';
import type { UserProfileSnapshot } from '../types/user-profile-snapshot';

export type UserId = number & {
  readonly __identifierBrand: 'UserId';
};

/**
 * User Domain Entity
 * Represents a user in the application
 */
export class User {
  constructor(
    public readonly id: UserId,
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
    public readonly avatar: Media | null,
    public readonly createdAt: Date,
    public readonly refreshTokenHash: string | null = null,
    public readonly refreshTokenExpiresAt: Date | null = null,
  ) {}

  /**
   * Creates a sanitized version of user without sensitive data
   */
  toSafeObject(): Omit<User, 'password' | 'refreshTokenHash' | 'refreshTokenExpiresAt'> {
    const { password, refreshTokenHash, refreshTokenExpiresAt, ...safeUser } = this;
    return safeUser as Omit<User, 'password' | 'refreshTokenHash' | 'refreshTokenExpiresAt'>;
  }

  toProfileSnapshot(): UserProfileSnapshot {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      createdAt: this.createdAt,
      avatarVersion: this.avatar?.versionToken() ?? null,
    };
  }
}
