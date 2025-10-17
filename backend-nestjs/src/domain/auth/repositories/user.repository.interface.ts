import { User } from '../entities/user.entity';

/**
 * User Repository Interface (Port)
 * Defines the contract for user data access
 */
export interface IUserRepository {
  /**
   * Creates a new user
   */
  create(
    username: string,
    email: string,
    password: string,
    isAdmin?: boolean,
  ): Promise<User>;

  /**
   * Finds a user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Finds a user by ID
   */
  findById(id: number): Promise<User | null>;

  /**
   * Finds a user by username
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Checks if a user exists by email or username
   */
  exists(email: string, username: string): Promise<boolean>;
}
