import { describe, expect, it, vi } from 'vitest';
import type { AuthSessionTransport } from '../../application/identity/contracts/auth-runtime.port';
import { StorageKey } from '../../domains/shared/value-objects/storage-key';
import { AuthFixtureFactory } from '../../test-utils/fixtures/auth-fixture-factory';
import { StoragePortMockFactory } from '../../test-utils/mocks/storage-port-mock-factory';
import { PersistedAuthSessionAdapter } from './persisted-auth-session.adapter';

const authFixtureFactory = new AuthFixtureFactory();
const storagePortMockFactory = new StoragePortMockFactory();

describe('PersistedAuthSessionAdapter', () => {
  function createTransportMock(): AuthSessionTransport {
    return {
      setAuthSessionTokens: vi.fn(),
      registerAuthSessionHandlers: vi.fn(),
    };
  }

  describe('commit()', () => {
    it('persists the auth session and forwards tokens to the transport', () => {
      const storage = storagePortMockFactory.create();
      const transport = createTransportMock();
      const service = new PersistedAuthSessionAdapter(storage, transport);

      service.commit(
        authFixtureFactory.createAuthSession({ user: { id: 7, avatarUri: undefined } }),
      );

      expect(storage.setItem).toHaveBeenCalledWith(StorageKey.AUTH_ACCESS_TOKEN, 'access-token');
      expect(storage.setItem).toHaveBeenCalledWith(StorageKey.AUTH_REFRESH_TOKEN, 'refresh-token');
      expect(storage.setItem).toHaveBeenCalledWith(
        StorageKey.AUTH_USER,
        authFixtureFactory.createSerializedUser({ id: 7, avatarUri: undefined }),
      );
      expect(transport.setAuthSessionTokens).toHaveBeenCalledWith({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });
  });

  describe('restore()', () => {
    it('returns a restored auth session and replays tokens to the transport', () => {
      const storage = storagePortMockFactory.create({
        [StorageKey.AUTH_ACCESS_TOKEN]: 'access-token',
        [StorageKey.AUTH_REFRESH_TOKEN]: 'refresh-token',
        [StorageKey.AUTH_USER]: authFixtureFactory.createSerializedUser({
          id: 4,
          username: 'arcade',
          email: 'arcade@pleey.io',
          avatarUri: undefined,
        }),
      });
      const transport = createTransportMock();
      const service = new PersistedAuthSessionAdapter(storage, transport);

      const restored = service.restore();

      expect(restored).toEqual(
        authFixtureFactory.createAuthSession({
          expiresIn: 0,
          user: {
            id: 4,
            username: 'arcade',
            email: 'arcade@pleey.io',
            avatarUri: undefined,
          },
        }),
      );
      expect(transport.setAuthSessionTokens).toHaveBeenCalledWith({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      });
    });

    it('clears persisted data when the stored user payload is invalid JSON', () => {
      const storage = storagePortMockFactory.create({
        [StorageKey.AUTH_ACCESS_TOKEN]: 'access-token',
        [StorageKey.AUTH_REFRESH_TOKEN]: 'refresh-token',
        [StorageKey.AUTH_USER]: '{invalid-json',
      });
      const transport = createTransportMock();
      const service = new PersistedAuthSessionAdapter(storage, transport);

      const restored = service.restore();

      expect(restored).toBeNull();
      expect(storage.removeItem).toHaveBeenCalledWith(StorageKey.AUTH_ACCESS_TOKEN);
      expect(storage.removeItem).toHaveBeenCalledWith(StorageKey.AUTH_REFRESH_TOKEN);
      expect(storage.removeItem).toHaveBeenCalledWith(StorageKey.AUTH_USER);
      expect(transport.setAuthSessionTokens).toHaveBeenCalledWith({
        accessToken: null,
        refreshToken: null,
      });
    });

    it('clears persisted data when the stored user payload shape is invalid', () => {
      const storage = storagePortMockFactory.create({
        [StorageKey.AUTH_ACCESS_TOKEN]: 'access-token',
        [StorageKey.AUTH_REFRESH_TOKEN]: 'refresh-token',
        [StorageKey.AUTH_USER]: JSON.stringify({
          id: 4,
          username: 'arcade',
          email: 'arcade@pleey.io',
        }),
      });
      const transport = createTransportMock();
      const service = new PersistedAuthSessionAdapter(storage, transport);

      const restored = service.restore();

      expect(restored).toBeNull();
      expect(storage.removeItem).toHaveBeenCalledWith(StorageKey.AUTH_ACCESS_TOKEN);
      expect(storage.removeItem).toHaveBeenCalledWith(StorageKey.AUTH_REFRESH_TOKEN);
      expect(storage.removeItem).toHaveBeenCalledWith(StorageKey.AUTH_USER);
      expect(transport.setAuthSessionTokens).toHaveBeenCalledWith({
        accessToken: null,
        refreshToken: null,
      });
    });
  });

  describe('updateUser()', () => {
    it('persists the updated user when an auth session exists', () => {
      const storage = storagePortMockFactory.create({
        [StorageKey.AUTH_ACCESS_TOKEN]: 'access-token',
        [StorageKey.AUTH_REFRESH_TOKEN]: 'refresh-token',
        [StorageKey.AUTH_USER]: authFixtureFactory.createSerializedUser({
          id: 4,
          username: 'arcade',
          email: 'arcade@pleey.io',
          avatarUri: '/api/avatars/users/4?v=old',
        }),
      });
      const transport = createTransportMock();
      const service = new PersistedAuthSessionAdapter(storage, transport);

      service.updateUser(
        authFixtureFactory.createUser({
          id: 4,
          username: 'arcade',
          email: 'arcade@pleey.io',
          avatarUri: '/api/avatars/users/4?v=new',
        }),
      );

      expect(storage.setItem).toHaveBeenCalledWith(
        StorageKey.AUTH_USER,
        authFixtureFactory.createSerializedUser({
          id: 4,
          username: 'arcade',
          email: 'arcade@pleey.io',
          avatarUri: '/api/avatars/users/4?v=new',
        }),
      );
    });

    it('does not persist the user when tokens are missing', () => {
      const storage = storagePortMockFactory.create();
      const transport = createTransportMock();
      const service = new PersistedAuthSessionAdapter(storage, transport);

      service.updateUser(
        authFixtureFactory.createUser({
          id: 4,
          username: 'arcade',
          email: 'arcade@pleey.io',
          avatarUri: '/api/avatars/users/4?v=new',
        }),
      );

      expect(storage.setItem).not.toHaveBeenCalledWith(StorageKey.AUTH_USER, expect.any(String));
    });
  });
});
