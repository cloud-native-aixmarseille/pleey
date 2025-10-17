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
    public readonly createdAt: Date,
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
  toSafeObject(): Omit<User, 'password'> {
    const { password, ...safeUser } = this;
    return safeUser as Omit<User, 'password'>;
  }
}
