import { User } from '../../../shared/types';

/**
 * Authentication Repository Interface
 * Defines the contract for authentication data operations
 * Following Dependency Inversion Principle (SOLID)
 */
export interface IAuthRepository {
  /**
   * Authenticate user with credentials
   * @throws Error if authentication fails
   */
  login(email: string, password: string): Promise<{ token: string; user: User }>;

  /**
   * Register a new user
   * @throws Error if registration fails
   */
  register(username: string, email: string, password: string): Promise<void>;

  /**
   * Retrieve the authenticated user profile
   */
  getCurrentUser(): Promise<User>;

  /**
   * Update the authenticated user profile
   */
  updateProfile(updates: { username?: string; email?: string }): Promise<User>;

  /**
   * Request the backend to regenerate the authenticated user's avatar
   */
  regenerateAvatar(): Promise<User>;
}
