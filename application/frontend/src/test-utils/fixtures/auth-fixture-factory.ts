import type { AuthSession } from '@pleey/contracts/identity';
import { UserIdentifier } from '../../application/identity/shared/services/identifiers/user-identifier';
import type { User, UserId } from '../../domains/identity/entities/user';
import { coerceUuidV7TestValue } from './uuid-v7-test-value';

interface UserPayload {
  readonly id: string;
  readonly username: string;
  readonly email: string;
  readonly avatarUri?: string | null;
  readonly createdAt?: string | null;
}

interface UserPayloadOverrides extends Omit<Partial<UserPayload>, 'id'> {
  readonly id?: number | string | UserId;
}

interface AuthSessionOverrides extends Omit<Partial<AuthSession>, 'user'> {
  readonly user?: UserPayloadOverrides;
}

const userIdentifier = new UserIdentifier();

function hasOwn<TObject extends object>(target: TObject, key: PropertyKey): boolean {
  return Object.hasOwn(target, key);
}

export class AuthFixtureFactory {
  createUser(overrides: UserPayloadOverrides = {}): User {
    const userPayload = this.createUserPayload(overrides);

    return {
      id: userIdentifier.parse(userPayload.id),
      username: userPayload.username,
      email: userPayload.email,
      ...(hasOwn(userPayload, 'avatarUri') ? { avatarUri: userPayload.avatarUri } : {}),
      ...(hasOwn(userPayload, 'createdAt') ? { createdAt: userPayload.createdAt } : {}),
    };
  }

  createUserPayload(overrides: UserPayloadOverrides = {}): UserPayload {
    const id = coerceUuidV7TestValue(overrides.id ?? 1);
    const avatarUri = hasOwn(overrides, 'avatarUri')
      ? overrides.avatarUri
      : `https://api.example.com/api/avatars/users/${id}?v=fingerprint`;
    const createdAt = hasOwn(overrides, 'createdAt') ? overrides.createdAt : undefined;

    return {
      id,
      username: overrides.username ?? 'captain',
      email: overrides.email ?? 'captain@pleey.io',
      ...(avatarUri !== undefined ? { avatarUri } : {}),
      ...(createdAt !== undefined ? { createdAt } : {}),
    };
  }

  createAuthSession(overrides: AuthSessionOverrides = {}): AuthSession {
    const { user: userOverrides, ...sessionOverrides } = overrides;

    return {
      id: '11111111-1111-4111-8111-111111111111',
      isAnonymous: false,
      expiresIn: 3600,
      user: this.createUser(userOverrides),
      ...sessionOverrides,
    };
  }
}
