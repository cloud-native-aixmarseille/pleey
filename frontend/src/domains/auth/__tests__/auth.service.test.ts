import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../auth.service';

// Mock fetch globally
global.fetch = vi.fn();

describe('AuthService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockReset();
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        token: 'mock-jwt-token',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com',
          isAdmin: false
        }
      };

      global.fetch.mockResolvedValueOnce({
        json: async () => mockResponse,
        ok: true
      });

      const result = await authService.login('test@example.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
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
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(authService.login('wrong@example.com', 'wrongpass'))
        .rejects.toThrow('Network error');
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      await authService.register('newuser', 'new@example.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
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
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 400
      });

      await expect(authService.register('user', 'email@test.com', 'pass'))
        .rejects.toThrow('Registration failed');
    });
  });
});
