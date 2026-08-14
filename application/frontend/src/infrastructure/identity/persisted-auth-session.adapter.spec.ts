import { describe, expect, it } from 'vitest';
import { StorageKey } from '../../domains/shared/value-objects/storage-key';
import { AuthFixtureFactory } from '../../test-utils/fixtures/auth-fixture-factory';
import { AuthSessionTransportMockFactory } from '../../test-utils/mocks/auth-session-transport-mock-factory';
import { StoragePortMockFactory } from '../../test-utils/mocks/storage-port-mock-factory';
import { PersistedAuthSessionAdapter } from './persisted-auth-session.adapter';

const authFixtureFactory = new AuthFixtureFactory();
const authSessionTransportMockFactory = new AuthSessionTransportMockFactory();
const storagePortMockFactory = new StoragePortMockFactory();

describe('PersistedAuthSessionAdapter', () => {
  describe('commit()', () => {
    it('persists the auth session and forwards tokens to the transport', () => {
      // Arrange
      const storage = storagePortMockFactory.create();
      const transport = authSessionTransportMockFactory.create();
      const service = new PersistedAuthSessionAdapter(storage, transport);

      // Act
      service.commit(authFixtureFactory.createAuthSession({ user: { id: 7, avatarUri: undefined } }));

      // Assert
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
      // Arrange
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
      const transport = authSessionTransportMockFactory.create();
      const service = new PersistedAuthSessionAdapter(storage, transport);

      // Act
      const restored = service.restore();

      // Assert
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
      // Arrange
      const storage = storagePortMockFactory.create({
        [StorageKey.AUTH_ACCESS_TOKEN]: 'access-token',
        [StorageKey.AUTH_REFRESH_TOKEN]: 'refresh-token',
        [StorageKey.AUTH_USER]: '{invalid-json',
      });
      const transport = authSessionTransportMockFactory.create();
      const service = new PersistedAuthSessionAdapter(storage, transport);

      // Act
      const restored = service.restore();

      // Assert
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
      // Arrange
      const storage = storagePortMockFactory.create({
        [StorageKey.AUTH_ACCESS_TOKEN]: 'access-token',
        [StorageKey.AUTH_REFRESH_TOKEN]: 'refresh-token',
        [StorageKey.AUTH_USER]: JSON.stringify({
          id: 4,
          username: 'arcade',
          email: 'arcade@pleey.io',
        }),
      });
      const transport = authSessionTransportMockFactory.create();
      const service = new PersistedAuthSessionAdapter(storage, transport);

      // Act
      const restored = service.restore();

      // Assert
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
      // Arrange
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
      const transport = authSessionTransportMockFactory.create();
      const service = new PersistedAuthSessionAdapter(storage, transport);

      // Act
      service.updateUser(
        authFixtureFactory.createUser({
          id: 4,
          username: 'arcade',
          email: 'arcade@pleey.io',
          avatarUri: '/api/avatars/users/4?v=new',
        }),
      );

      // Assert
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
      // Arrange
      const storage = storagePortMockFactory.create();
      const transport = authSessionTransportMockFactory.create();
      const service = new PersistedAuthSessionAdapter(storage, transport);

      // Act
      service.updateUser(
        authFixtureFactory.createUser({
          id: 4,
          username: 'arcade',
          email: 'arcade@pleey.io',
          avatarUri: '/api/avatars/users/4?v=new',
        }),
      );

      // Assert
      expect(storage.setItem).not.toHaveBeenCalledWith(StorageKey.AUTH_USER, expect.any(String));
    });
  });
});
