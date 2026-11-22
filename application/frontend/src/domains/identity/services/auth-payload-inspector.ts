import { injectable } from 'inversify';
import type { User } from '../entities/user';

@injectable()
export class AuthPayloadInspector {
  isUser(value: unknown): value is User {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<User>;

    return (
      typeof candidate.id === 'string' && typeof candidate.username === 'string' && typeof candidate.email === 'string'
    );
  }

  toUser(value: unknown): User | null {
    if (!this.isUser(value)) {
      return null;
    }

    return value;
  }
}
