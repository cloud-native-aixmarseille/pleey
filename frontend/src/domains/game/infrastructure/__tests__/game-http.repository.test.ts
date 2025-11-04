import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameHttpRepository } from '../game-http.repository';
import { GameSession } from '../../../shared/types';

// Mock fetch
global.fetch = vi.fn();

describe('GameHttpRepository', () => {
  let repository: GameHttpRepository;

  beforeEach(() => {
    repository = new GameHttpRepository('http://localhost:3001');
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a game session', async () => {
      const mockSession: GameSession = {
        pin: '123456',
        quiz_id: 1,
        status: 'waiting',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      } as Response);

      const result = await repository.createSession('test-token', 1);

      expect(result).toEqual(mockSession);
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/game/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ quiz_id: 1 }),
      });
    });

    it('should throw error when session creation fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
      } as Response);

      await expect(repository.createSession('test-token', 1)).rejects.toThrow(
        'Failed to create game session'
      );
    });
  });
});
