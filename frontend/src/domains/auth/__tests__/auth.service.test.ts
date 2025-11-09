import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { authService } from '../auth.service';
import { fetchClient } from '../../../shared/api/openapiClient';

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        token: 'legacy-token',
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 7200,
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          isAdmin: false,
          avatarUrl: null
        }
      };

      const postSpy = vi.spyOn(fetchClient, 'POST') as unknown as Mock;
      postSpy.mockResolvedValueOnce({
        data: mockResponse,
        error: undefined,
      } as any);

      const result = await authService.login('test@example.com', 'password123');

      expect(postSpy).toHaveBeenCalledWith(
        '/api/login',
        expect.objectContaining({
          body: { email: 'test@example.com', password: 'password123' },
        })
      );

      expect(result).toEqual({
        token: 'mock-jwt-token',
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 7200,
        user: mockResponse.user,
      });
      expect(result.token).toBe('mock-jwt-token');
      expect(result.user.username).toBe('testuser');
    });

    it('should handle login failure', async () => {
      const postSpy = vi.spyOn(fetchClient, 'POST') as unknown as Mock;
      postSpy.mockResolvedValueOnce({
        data: undefined,
        error: new Error('Network error'),
      } as any);

      await expect(authService.login('wrong@example.com', 'wrongpass')).rejects.toThrow(
        'common.errors.network',
      );
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const postSpy = vi.spyOn(fetchClient, 'POST') as unknown as Mock;
      postSpy.mockResolvedValueOnce({
        data: undefined,
        error: undefined,
      } as any);

      await authService.register('newuser', 'new@example.com', 'password123');

      expect(postSpy).toHaveBeenCalledWith(
        '/api/register',
        expect.objectContaining({
          body: { username: 'newuser', email: 'new@example.com', password: 'password123' },
        })
      );
    });

    it('should throw error when registration fails', async () => {
      const postSpy = vi.spyOn(fetchClient, 'POST') as unknown as Mock;
      postSpy.mockResolvedValueOnce({
        data: undefined,
        error: new Error('Password too short'),
      } as any);

      await expect(authService.register('user', 'email@test.com', 'pass')).rejects.toThrow(
        'auth.errors.passwordTooShort',
      );
    });
  });

  describe('regenerateAvatar', () => {
    it('should regenerate avatar successfully', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        isAdmin: false,
        avatarUrl: '/api/avatars/users/1?v=fingerprint'
      };

      const postSpy = vi.spyOn(fetchClient, 'POST') as unknown as Mock;
      postSpy.mockResolvedValueOnce({
        data: mockUser,
        error: undefined,
      } as any);

      const result = await authService.regenerateAvatar();

      expect(postSpy).toHaveBeenCalledWith(
        '/api/profile/me/avatar',
        expect.any(Object)
      );

      expect(result).toEqual(mockUser);
    });

    it('should throw error when regeneration fails', async () => {
      const postSpy = vi.spyOn(fetchClient, 'POST') as unknown as Mock;
      postSpy.mockResolvedValueOnce({
        data: undefined,
        error: new Error('Unauthorized'),
      } as any);

      await expect(authService.regenerateAvatar()).rejects.toThrow('auth.errors.unauthorized');
    });
  });
});
