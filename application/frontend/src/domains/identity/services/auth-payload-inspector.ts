import { injectable } from 'inversify';
import type { AuthSession } from '../entities/auth-session';
import type { User } from '../entities/user';

interface AuthSessionCandidate {
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly expiresIn?: number;
  readonly user?: unknown;
}

@injectable()
export class AuthPayloadInspector {
  isUser(value: unknown): value is User {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<User>;

    return (
      typeof candidate.id === 'number' &&
      typeof candidate.username === 'string' &&
      typeof candidate.email === 'string'
    );
  }

  toUser(value: unknown): User | null {
    if (!this.isUser(value)) {
      return null;
    }

    return value;
  }

  toAuthSession(value: unknown): AuthSession | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const candidate = value as AuthSessionCandidate;

    if (
      typeof candidate.accessToken !== 'string' ||
      typeof candidate.refreshToken !== 'string' ||
      typeof candidate.expiresIn !== 'number'
    ) {
      return null;
    }

    const user = this.toUser(candidate.user);

    if (!user) {
      return null;
    }

    return {
      accessToken: candidate.accessToken,
      refreshToken: candidate.refreshToken,
      expiresIn: candidate.expiresIn,
      user,
    };
  }
}
