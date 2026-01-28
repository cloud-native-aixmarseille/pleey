import { describe, expect, it, vi } from 'vitest';
import type { AuthSessionTransport } from '../../application/identity/contracts/auth-runtime.port';
import { StorageKey } from '../../domains/shared/value-objects/storage-key';
import { StoragePortMockFactory } from '../../test-utils/factories/storage-port-mock-factory';
import { AppAuthSessionRuntime } from './app-auth-session-runtime';

const storagePortMockFactory = new StoragePortMockFactory();

describe('AppAuthSessionRuntime', () => {
  function createTransportMock(): AuthSessionTransport {
    return {
      setAuthSessionTokens: vi.fn(),
      registerAuthSessionHandlers: vi.fn(),
    };
  }

  describe('commit()', () => {
    it('persists the auth session and forwards tokens to the transport', () => {
      // Arrange
      const storage = storagePortMockFactory.create();
      const transport = createTransportMock();
      const service = new AppAuthSessionRuntime(storage, transport);

      // Act
      service.commit({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 3600,
        user: { id: 7, username: 'captain', email: 'captain@pleey.io' },
      });

      // Assert
      expect(storage.setItem).toHaveBeenCalledWith(StorageKey.AUTH_ACCESS_TOKEN, 'access-token');
      expect(storage.setItem).toHaveBeenCalledWith(StorageKey.AUTH_REFRESH_TOKEN, 'refresh-token');
      expect(storage.setItem).toHaveBeenCalledWith(
        StorageKey.AUTH_USER,
        JSON.stringify({ id: 7, username: 'captain', email: 'captain@pleey.io' }),
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
        [StorageKey.AUTH_USER]: JSON.stringify({
          id: 4,
          username: 'arcade',
          email: 'arcade@pleey.io',
        }),
      });
      const transport = createTransportMock();
      const service = new AppAuthSessionRuntime(storage, transport);

      // Act
      const restored = service.restore();

      // Assert
      expect(restored).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        expiresIn: 0,
        user: {
          id: 4,
          username: 'arcade',
          email: 'arcade@pleey.io',
        },
      });
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
      const transport = createTransportMock();
      const service = new AppAuthSessionRuntime(storage, transport);

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
          id: '4',
          username: 'arcade',
          email: 'arcade@pleey.io',
        }),
      });
      const transport = createTransportMock();
      const service = new AppAuthSessionRuntime(storage, transport);

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
      const storage = storagePortMockFactory.create({
        [StorageKey.AUTH_ACCESS_TOKEN]: 'access-token',
        [StorageKey.AUTH_REFRESH_TOKEN]: 'refresh-token',
        [StorageKey.AUTH_USER]: JSON.stringify({
          id: 4,
          username: 'arcade',
          email: 'arcade@pleey.io',
          avatarUri: '/api/avatars/users/4?v=old',
        }),
      });
      const transport = createTransportMock();
      const service = new AppAuthSessionRuntime(storage, transport);

      service.updateUser({
        id: 4,
        username: 'arcade',
        email: 'arcade@pleey.io',
        avatarUri: '/api/avatars/users/4?v=new',
      });

      expect(storage.setItem).toHaveBeenCalledWith(
        StorageKey.AUTH_USER,
        JSON.stringify({
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
      const service = new AppAuthSessionRuntime(storage, transport);

      service.updateUser({
        id: 4,
        username: 'arcade',
        email: 'arcade@pleey.io',
        avatarUri: '/api/avatars/users/4?v=new',
      });

      expect(storage.setItem).not.toHaveBeenCalledWith(StorageKey.AUTH_USER, expect.any(String));
    });
  });
});
