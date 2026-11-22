import { describe, expect, it, vi } from 'vitest';
import { UserIdentifier } from '../../application/identity/shared/services/identifiers/user-identifier';
import { StorageKey } from '../../domains/shared/value-objects/storage-key';
import { AuthFixtureFactory } from '../../test-utils/fixtures/auth-fixture-factory';
import { StoragePortMockFactory } from '../../test-utils/mocks/storage-port-mock-factory';
import { PersistedAuthSessionAdapter } from './persisted-auth-session.adapter';

const { anonymousSignInMock, getSessionMock } = vi.hoisted(() => ({
  anonymousSignInMock: vi.fn(),
  getSessionMock: vi.fn(),
}));

vi.mock('./better-auth-client', () => ({
  betterAuthClient: {
    getSession: getSessionMock,
    signIn: { anonymous: anonymousSignInMock },
  },
}));

const storagePortMockFactory = new StoragePortMockFactory();
const userIdentifier = new UserIdentifier();

describe('PersistedAuthSessionAdapter', () => {
  it('removes legacy browser-held credentials and recoverable drafts on clear', () => {
    // Arrange
    const storage = storagePortMockFactory.create({
      [StorageKey.AUTH_ACCESS_TOKEN]: 'token',
      [StorageKey.AUTH_REFRESH_TOKEN]: 'refresh',
      [StorageKey.AUTH_USER]: '{}',
      [StorageKey.THEME_DRAFTS]: 'drafts',
      'party.guest-session.v1': '{}',
    });
    const service = new PersistedAuthSessionAdapter(storage, userIdentifier);

    // Act
    service.clear();

    // Assert
    expect(storage.getItem(StorageKey.AUTH_ACCESS_TOKEN)).toBeNull();
    expect(storage.getItem(StorageKey.AUTH_REFRESH_TOKEN)).toBeNull();
    expect(storage.getItem(StorageKey.AUTH_USER)).toBeNull();
    expect(storage.getItem(StorageKey.THEME_DRAFTS)).toBeNull();
    expect(storage.getItem('party.guest-session.v1')).toBeNull();
  });

  it('does not persist or suspend application-held session secrets', () => {
    // Arrange
    const storage = storagePortMockFactory.create();
    const service = new PersistedAuthSessionAdapter(storage, userIdentifier);

    // Act
    service.commit(new AuthFixtureFactory().createAuthSession());
    service.updateUser(new AuthFixtureFactory().createUser());
    service.suspend();

    // Assert
    expect(storage.setItem).not.toHaveBeenCalled();
    expect(storage.removeItem).not.toHaveBeenCalled();
  });

  it('maps a confirmed Better Auth cookie session without exposing tokens', async () => {
    // Arrange
    const expiresAt = new Date(Date.now() + 60_000);
    getSessionMock.mockResolvedValueOnce({
      data: {
        session: { id: 'session-4', expiresAt },
        user: {
          email: 'arcade@pleey.io',
          id: '00000000-0000-7000-8000-000000000004',
          isAnonymous: true,
          name: 'arcade',
        },
      },
      error: null,
    });
    const service = new PersistedAuthSessionAdapter(storagePortMockFactory.create(), userIdentifier);

    // Act
    const restored = await service.restore();

    // Assert
    expect(restored).toMatchObject({
      id: 'session-4',
      isAnonymous: true,
      user: {
        email: 'arcade@pleey.io',
        id: '00000000-0000-7000-8000-000000000004',
        username: 'arcade',
      },
    });
    expect(restored?.expiresIn).toBeGreaterThan(0);
  });

  it.each([
    { error: new Error('unavailable'), data: null },
    { error: null, data: null },
  ])('returns no application session for an unconfirmed cookie response', async (response) => {
    // Arrange
    getSessionMock.mockResolvedValueOnce(response);
    anonymousSignInMock.mockResolvedValueOnce({ data: null, error: new Error('anonymous unavailable') });
    const service = new PersistedAuthSessionAdapter(storagePortMockFactory.create(), userIdentifier);

    // Act
    const restored = await service.restore();

    // Assert
    expect(restored).toBeNull();
  });

  it('revalidates cookie authority when the browser regains focus', () => {
    // Arrange
    const service = new PersistedAuthSessionAdapter(storagePortMockFactory.create(), userIdentifier);
    const listener = vi.fn();
    const unwatch = service.watch(listener);

    // Act
    window.dispatchEvent(new Event('focus'));
    unwatch();
    window.dispatchEvent(new Event('focus'));

    // Assert
    expect(listener).toHaveBeenCalledOnce();
  });
});
