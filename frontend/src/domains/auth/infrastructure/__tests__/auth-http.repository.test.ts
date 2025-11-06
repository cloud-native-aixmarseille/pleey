import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthHttpRepository } from '../auth-http.repository';

globalThis.fetch = vi.fn();

describe('AuthHttpRepository', () => {
  const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
  let repository: AuthHttpRepository;

  beforeEach(() => {
    repository = new AuthHttpRepository();
    vi.clearAllMocks();
    fetchMock.mockReset();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockResponse = {
        token: 'test-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          isAdmin: false,
        },
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await repository.login('test@example.com', 'password123');

      expect(result).toEqual(mockResponse);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('should throw error on invalid credentials', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      } as Response);

      await expect(repository.login('test@example.com', 'wrong-password')).rejects.toThrow('auth.errors.invalidCredentials');
    });

    it('should throw error on invalid response structure', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token' }),
      } as Response);

      await expect(repository.login('test@example.com', 'password123')).rejects.toThrow('auth.errors.invalidResponse');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await repository.register('testuser', 'test@example.com', 'password123');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/register'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('should throw error on registration failure', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already exists' }),
      } as Response);

      await expect(repository.register('testuser', 'test@example.com', 'password123')).rejects.toThrow('auth.errors.userAlreadyExists');
    });
  });

  describe('regenerateAvatar', () => {
    it('should regenerate avatar successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        isAdmin: false,
        avatarUrl: 'data:image/svg+xml;base64,ZmFrZQ==',
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response);

      const result = await repository.regenerateAvatar();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/profile/me/avatar'),
        expect.objectContaining({ method: 'POST' }),
      );
      expect(result).toEqual(mockUser);
    });

    it('should throw error when regeneration fails', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Unable to regenerate avatar' }),
      } as Response);

      await expect(repository.regenerateAvatar()).rejects.toThrow('profile.avatarRegenerateError');
    });
  });
});
