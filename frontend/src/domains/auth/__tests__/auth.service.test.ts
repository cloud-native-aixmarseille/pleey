import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { authService } from '../auth.service';

// Mock fetch globally
globalThis.fetch = vi.fn();
const fetchMock = globalThis.fetch as unknown as Mock;

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          isAdmin: false,
          avatarUrl: null
        }
      };

      fetchMock.mockResolvedValueOnce({
        json: async () => mockResponse,
        ok: true
      });

      const result = await authService.login('test@example.com', 'password123');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/login'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' })
        })
      );

      expect(result).toEqual(mockResponse);
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.username).toBe('testuser');
    });

    it('should handle login failure', async () => {
      fetchMock.mockRejectedValueOnce(new Error('Network error'));

      await expect(authService.login('wrong@example.com', 'wrongpass'))
        .rejects.toThrow('common.errors.network');
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await authService.register('newuser', 'new@example.com', 'password123');

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/register'),
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'newuser',
            email: 'new@example.com',
            password: 'password123'
          })
        })
      );
    });

    it('should throw error when registration fails', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      await expect(authService.register('user', 'email@test.com', 'pass'))
        .rejects.toThrow('auth.errors.registrationFailed');
    });
  });

  describe('regenerateAvatar', () => {
    it('should regenerate avatar successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        isAdmin: false,
        avatarUrl: 'data:image/svg+xml;base64,ZmFrZQ=='
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser
      });

      const result = await authService.regenerateAvatar();

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/profile/me/avatar'),
        expect.objectContaining({
          method: 'POST'
        })
      );

      expect(result).toEqual(mockUser);
    });

    it('should throw error when regeneration fails', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        status: 500
      });

      await expect(authService.regenerateAvatar()).rejects.toThrow('profile.avatarRegenerateError');
    });
  });
});
