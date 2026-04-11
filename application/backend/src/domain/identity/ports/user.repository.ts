import type { Media } from '../../media/entities/media';
import type { User, UserId } from '../entities/user';

export const UserRepositoryProvider = Symbol('UserRepository');

/**
 * User Repository Interface (Port)
 * Defines the contract for user data access
 */
export interface UserRepository {
  /**
   * Creates a new user
   */
  create(username: string, email: string, password: string, avatar?: Media | null): Promise<User>;

  /**
   * Finds a user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Finds a user by ID
   */
  findById(id: UserId): Promise<User | null>;

  /**
   * Finds a user by username
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Checks if a user exists by email or username
   */
  exists(email: string, username: string): Promise<boolean>;

  /**
   * Updates a user profile and returns the updated entity
   */
  updateProfile(
    id: UserId,
    updates: {
      username?: string;
      email?: string;
      avatar?: Media | null;
    },
  ): Promise<User>;

  /**
   * Stores the hashed refresh token for a user
   */
  updateRefreshToken(
    id: UserId,
    refreshTokenHash: string,
    refreshTokenExpiresAt: Date,
  ): Promise<void>;

  /**
   * Clears the stored refresh token information
   */
  clearRefreshToken(id: UserId): Promise<void>;
}
