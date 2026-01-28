import type { Request } from 'express';
import { describe, expect, it } from 'vitest';
import type { UserProfileSnapshot } from '../../../../domain/auth/types/user-profile-snapshot';
import { AuthProfilePresenter } from './auth-profile-presenter';

describe('AuthProfilePresenter', () => {
  it('builds an absolute avatar URL from forwarded request headers', () => {
    const presenter = new AuthProfilePresenter();
    const profile = createProfile({ avatarVersion: TEST_AVATAR_VERSION });

    const result = presenter.presentUserProfile(profile, {
      headers: {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'api.pleey.example',
      },
      protocol: 'http',
      get: () => undefined,
    });

    expect(result.avatarUri).toBe(
      `https://api.pleey.example/api/avatars/users/7?v=${TEST_AVATAR_VERSION}`,
    );
  });

  it('returns null avatarUri when the user has no avatar', () => {
    const presenter = new AuthProfilePresenter();
    const profile = createProfile({ avatarVersion: null });

    const result = presenter.presentUserProfile(profile, {
      headers: {},
      protocol: 'http',
      get: readHostHeader('localhost:3000'),
    });

    expect(result.avatarUri).toBeNull();
  });

  it('uses API_BASE_URL when request host data is unavailable', () => {
    const presenter = new AuthProfilePresenter('https://api.pleey.example/api');
    const profile = createProfile({ avatarVersion: TEST_AVATAR_VERSION });

    const result = presenter.presentUserProfile(profile);

    expect(result.avatarUri).toBe(
      `https://api.pleey.example/api/avatars/users/7?v=${TEST_AVATAR_VERSION}`,
    );
  });

  it('falls back to a relative avatar path when neither request nor config are available', () => {
    const presenter = new AuthProfilePresenter();
    const profile = createProfile({ avatarVersion: TEST_AVATAR_VERSION });

    const result = presenter.presentUserProfile(profile);

    expect(result.avatarUri).toBe(`/api/avatars/users/7?v=${TEST_AVATAR_VERSION}`);
  });

  it('applies the same transformation to auth responses', () => {
    const presenter = new AuthProfilePresenter();

    const result = presenter.presentAuthResponse(
      {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        user: {
          id: 7,
          username: 'captain',
          email: 'captain@pleey.io',
          avatarVersion: TEST_AVATAR_VERSION,
        },
      },
      {
        headers: { host: 'localhost:3000' },
        protocol: 'http',
        get: readHostHeader('localhost:3000'),
      },
    );

    expect(result.user.avatarUri).toBe(
      `http://localhost:3000/api/avatars/users/7?v=${TEST_AVATAR_VERSION}`,
    );
  });
});

const TEST_AVATAR_VERSION = '42-1743465600000';

function readHostHeader(host: string): Request['get'] {
  return ((name: string) =>
    name.toLowerCase() === 'set-cookie' ? undefined : host) as Request['get'];
}

function createProfile(overrides: Partial<UserProfileSnapshot> = {}): UserProfileSnapshot {
  return {
    id: 7,
    username: 'captain',
    email: 'captain@pleey.io',
    avatarVersion: TEST_AVATAR_VERSION,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  } as UserProfileSnapshot;
}
