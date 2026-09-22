import type { User } from './user';

export class UserAuthentication {
  constructor(
    public readonly user: User,
    public readonly password: string,
    public readonly refreshTokenHash: string | null = null,
    public readonly refreshTokenExpiresAt: Date | null = null,
    public readonly sessionId: string | null = null,
  ) {}
}
