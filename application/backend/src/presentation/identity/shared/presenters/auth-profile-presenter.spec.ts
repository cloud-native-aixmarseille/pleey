import type { Request } from 'express';
import { describe, expect, it } from 'vitest';
import type { UserProfileSnapshot } from '../../../../domain/identity/types/user-profile-snapshot';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { AuthProfilePresenter } from './auth-profile-presenter';

describe('AuthProfilePresenter', () => {
  it('builds an absolute avatar URL from forwarded request headers', () => {
    // Arrange
    const presenter = new AuthProfilePresenter();
    const profile = createProfile({ avatarVersion: TEST_AVATAR_VERSION });

    // Act
    const result = presenter.presentUserProfile(profile, {
      headers: {
        'x-forwarded-proto': 'https',
        'x-forwarded-host': 'api.pleey.example',
      },
      protocol: 'http',
      get: () => undefined,
    });

    // Assert
    expect(result.avatarUri).toBe(
      `https://api.pleey.example/api/avatars/users/${backendTestIdentifiers.user(7)}?v=${TEST_AVATAR_VERSION}`,
    );
  });

  it('returns null avatarUri when the user has no avatar', () => {
    // Arrange
    const presenter = new AuthProfilePresenter();
    const profile = createProfile({ avatarVersion: null });

    // Act
    const result = presenter.presentUserProfile(profile, {
      headers: {},
      protocol: 'http',
      get: readHostHeader('localhost:3000'),
    });

    // Assert
    expect(result.avatarUri).toBeNull();
  });

  it('uses API_BASE_URL when request host data is unavailable', () => {
    // Arrange
    const presenter = new AuthProfilePresenter('https://api.pleey.example/api');
    const profile = createProfile({ avatarVersion: TEST_AVATAR_VERSION });

    // Act
    const result = presenter.presentUserProfile(profile);

    // Assert
    expect(result.avatarUri).toBe(
      `https://api.pleey.example/api/avatars/users/${backendTestIdentifiers.user(7)}?v=${TEST_AVATAR_VERSION}`,
    );
  });

  it('falls back to a relative avatar path when neither request nor config are available', () => {
    // Arrange
    const presenter = new AuthProfilePresenter();
    const profile = createProfile({ avatarVersion: TEST_AVATAR_VERSION });

    // Act
    const result = presenter.presentUserProfile(profile);

    // Assert
    expect(result.avatarUri).toBe(`/api/avatars/users/${backendTestIdentifiers.user(7)}?v=${TEST_AVATAR_VERSION}`);
  });

  it('applies the same transformation to auth responses', () => {
    // Arrange
    const presenter = new AuthProfilePresenter();

    // Act
    const result = presenter.presentAuthResponse(
      {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        user: {
          id: backendTestIdentifiers.user(7),
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

    // Assert
    expect(result.user.avatarUri).toBe(
      `http://localhost:3000/api/avatars/users/${backendTestIdentifiers.user(7)}?v=${TEST_AVATAR_VERSION}`,
    );
  });
});

const TEST_AVATAR_VERSION = '42-1743465600000';

function readHostHeader(host: string): Request['get'] {
  return ((name: string) => (name.toLowerCase() === 'set-cookie' ? undefined : host)) as Request['get'];
}

function createProfile(overrides: Partial<UserProfileSnapshot> = {}): UserProfileSnapshot {
  return {
    id: backendTestIdentifiers.user(7),
    username: 'captain',
    email: 'captain@pleey.io',
    avatarVersion: TEST_AVATAR_VERSION,
    createdAt: new Date('2025-01-01T00:00:00.000Z'),
    ...overrides,
  } as UserProfileSnapshot;
}
