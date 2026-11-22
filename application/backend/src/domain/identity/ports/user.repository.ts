import type { Media } from '../../media/entities/media';
import type { User, UserId } from '../entities/user';

export const UserRepositoryProvider = Symbol('UserRepository');

/**
 * User Repository Interface (Port)
 * Defines the contract for user data access
 */
export interface UserRepository {
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
}
