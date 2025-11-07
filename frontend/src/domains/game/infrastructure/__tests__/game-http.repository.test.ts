import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameHttpRepository } from '../game-http.repository';
import { GameSession } from '../../../../shared/types';

globalThis.fetch = vi.fn();
const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;

describe('GameHttpRepository', () => {
  let repository: GameHttpRepository;

  beforeEach(() => {
    repository = new GameHttpRepository('http://localhost:3001');
    vi.clearAllMocks();
    fetchMock.mockReset();
  });

  describe('createSession', () => {
    it('should create a game session', async () => {
      const mockSession: GameSession = {
        pin: '123456',
        quiz_id: 1,
        status: 'waiting',
      };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession,
      } as Response);

      const result = await repository.createSession('test-token', 1);

      expect(result).toEqual(mockSession);
      expect(fetchMock).toHaveBeenCalledWith('http://localhost:3001/api/sessions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        },
        body: JSON.stringify({ quizId: 1 }),
      });
    });

    it('should throw error when session creation fails', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'game.errors.sessionCreateFailed' }),
      } as Response);

      await expect(repository.createSession('test-token', 1)).rejects.toThrow(
        'game.errors.sessionCreateFailed'
      );
    });
  });
});
