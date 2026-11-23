import { describe, expect, it, vi } from 'vitest';
import { UserIdentifier } from '../../application/identity/shared/services/identifiers/user-identifier';
import { StorageKey } from '../../domains/shared/value-objects/storage-key';
import { AuthFixtureFactory } from '../../test-utils/fixtures/auth-fixture-factory';
import { StoragePortMockFactory } from '../../test-utils/mocks/storage-port-mock-factory';
import { AuthSessionActor } from './auth-session.actor';
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
    const service = new PersistedAuthSessionAdapter(storage, userIdentifier, new AuthSessionActor());

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
    const service = new PersistedAuthSessionAdapter(storage, userIdentifier, new AuthSessionActor());

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
    const service = new PersistedAuthSessionAdapter(
      storagePortMockFactory.create(),
      userIdentifier,
      new AuthSessionActor(),
    );

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

  it('creates an anonymous session only after explicit play intent and under a Web Lock', async () => {
    // Arrange
    const expiresAt = new Date(Date.now() + 60_000);
    getSessionMock.mockResolvedValueOnce({ data: null, error: null }).mockResolvedValueOnce({
      data: {
        session: { id: 'session-anonymous', expiresAt },
        user: {
          email: 'anonymous@invalid.local',
          id: '00000000-0000-7000-8000-000000000005',
          isAnonymous: true,
          name: 'anonymous',
        },
      },
      error: null,
    });
    anonymousSignInMock.mockResolvedValueOnce({ data: {}, error: null });
    const request = vi.fn(async (_name, callback) => callback());
    vi.stubGlobal('navigator', { locks: { request } });
    const service = new PersistedAuthSessionAdapter(
      storagePortMockFactory.create(),
      userIdentifier,
      new AuthSessionActor(),
    );

    // Act
    const created = await service.ensureAnonymous();

    // Assert
    expect(request).toHaveBeenCalledWith('pleey-auth-session-initialization', expect.any(Function));
    expect(anonymousSignInMock).toHaveBeenCalledOnce();
    expect(created.isAnonymous).toBe(true);
    vi.unstubAllGlobals();
  });

  it('serializes two tab intents and creates only one anonymous identity', async () => {
    // Arrange
    const expiresAt = new Date(Date.now() + 60_000);
    const nativeSession = {
      data: {
        session: { id: 'session-shared', expiresAt },
        user: {
          email: 'shared@invalid.local',
          id: '00000000-0000-7000-8000-000000000006',
          isAnonymous: true,
          name: 'shared',
        },
      },
      error: null,
    };
    getSessionMock
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce(nativeSession)
      .mockResolvedValueOnce(nativeSession);
    anonymousSignInMock.mockResolvedValueOnce({ data: {}, error: null });
    let lockTail = Promise.resolve();
    const request = vi.fn(async (_name, callback) => {
      const current = lockTail.then(callback);
      lockTail = current.then(
        () => undefined,
        () => undefined,
      );
      return current;
    });
    vi.stubGlobal('navigator', { locks: { request } });
    const firstTab = new PersistedAuthSessionAdapter(
      storagePortMockFactory.create(),
      userIdentifier,
      new AuthSessionActor(),
    );
    const secondTab = new PersistedAuthSessionAdapter(
      storagePortMockFactory.create(),
      userIdentifier,
      new AuthSessionActor(),
    );

    // Act
    const [first, second] = await Promise.all([firstTab.ensureAnonymous(), secondTab.ensureAnonymous()]);

    // Assert
    expect(first.id).toBe('session-shared');
    expect(second.id).toBe('session-shared');
    expect(anonymousSignInMock).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });

  it.each([
    { error: new Error('unavailable'), data: null },
    { error: null, data: null },
  ])('does not create an anonymous replacement for an unconfirmed cookie response', async (response) => {
    // Arrange
    getSessionMock.mockResolvedValueOnce(response);
    const service = new PersistedAuthSessionAdapter(
      storagePortMockFactory.create(),
      userIdentifier,
      new AuthSessionActor(),
    );

    // Act
    const restored = response.error === null ? await service.restore() : await service.restore().catch(() => null);

    // Assert
    expect(restored).toBeNull();
    expect(anonymousSignInMock).not.toHaveBeenCalled();
  });

  it('revalidates cookie authority when the browser regains focus', () => {
    // Arrange
    const service = new PersistedAuthSessionAdapter(
      storagePortMockFactory.create(),
      userIdentifier,
      new AuthSessionActor(),
    );
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
