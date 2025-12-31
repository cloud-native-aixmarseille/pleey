/**
 * User Domain Entity
 * Represents a user in the quiz application
 */
export class User {
  constructor(
    public readonly id: number,
    public readonly username: string,
    public readonly email: string,
    public readonly password: string,
    public readonly isAdmin: boolean,
    public readonly avatarUrl: string | null,
    public readonly createdAt: Date,
    public readonly refreshTokenHash: string | null = null,
    public readonly refreshTokenExpiresAt: Date | null = null,
  ) {}

  /**
   * Checks if user has admin privileges
   */
  hasAdminPrivileges(): boolean {
    return this.isAdmin;
  }

  /**
   * Creates a sanitized version of user without sensitive data
   */
  toSafeObject(): Omit<User, 'password' | 'refreshTokenHash' | 'refreshTokenExpiresAt'> {
    const { password, refreshTokenHash, refreshTokenExpiresAt, ...safeUser } = this;
    return safeUser as Omit<User, 'password' | 'refreshTokenHash' | 'refreshTokenExpiresAt'>;
  }
}
