import type { Media } from '../../media/entities/media';
import type { UserProfileSnapshot } from '../types/user-profile-snapshot';

export type UserId = string & {
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
    public readonly avatar: Media | null,
    public readonly createdAt: Date,
  ) {}

  /**
   * Returns the user's profile data.
   */
  toSafeObject() {
    return { ...this };
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
