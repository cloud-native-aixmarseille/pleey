import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthHttpRepository } from '../auth-http.repository';

// Mock fetch
global.fetch = vi.fn();

describe('AuthHttpRepository', () => {
  let repository: AuthHttpRepository;

  beforeEach(() => {
    repository = new AuthHttpRepository('http://localhost:3001');
    vi.clearAllMocks();
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

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await repository.login('test@example.com', 'password123');

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
      });
    });

    it('should throw error on invalid credentials', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'Invalid credentials' }),
      } as Response);

      await expect(
        repository.login('test@example.com', 'wrong-password')
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error on invalid response structure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test-token' }), // Missing user
      } as Response);

      await expect(
        repository.login('test@example.com', 'password123')
      ).rejects.toThrow('Invalid login response');
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await repository.register('testuser', 'test@example.com', 'password123');

      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
        }),
      });
    });

    it('should throw error on registration failure', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already exists' }),
      } as Response);

      await expect(
        repository.register('testuser', 'test@example.com', 'password123')
      ).rejects.toThrow('Email already exists');
    });
  });
});
