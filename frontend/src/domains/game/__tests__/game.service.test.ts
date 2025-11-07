import { describe, it, expect, vi, beforeEach } from 'vitest';
import { gameService } from '../game.service';
import { socket } from '../../../shared/socket/socket.client';

// Mock the socket client
vi.mock('../../../shared/socket/socket.client', () => ({
  socket: {
    emit: vi.fn()
  }
}));

describe('GameService', () => {
  const mockToken = 'mock-jwt-token';
  const fetchMock = vi.fn();

  // Ensure fetch exists on the global scope for the tests
  globalThis.fetch = fetchMock as unknown as typeof fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    fetchMock.mockReset();
  });

  describe('createSession', () => {
    it('should create a game session', async () => {
      const mockSession = { pin: '123456' };

      fetchMock.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSession
      });

      const result = await gameService.createSession(mockToken, 1);

      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('/api/sessions/create'),
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`
          },
          body: JSON.stringify({ quizId: 1 })
        })
      );
      expect(result).toEqual(mockSession);
      expect(result.pin).toBe('123456');
    });

    it('should throw translated error when API fails', async () => {
      fetchMock.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ message: 'unit.test.error' })
      });

      await expect(gameService.createSession(mockToken, 1)).rejects.toThrow('unit.test.error');
    });
  });

  describe('joinGame', () => {
    it('should emit join-game event', () => {
      gameService.joinGame('123456', 'testuser', 1);

      expect(socket.emit).toHaveBeenCalledWith('join-game', {
        pin: '123456',
        username: 'testuser',
        userId: 1
      });
    });
  });

  describe('startGame', () => {
    it('should emit start-game event', () => {
      gameService.startGame('123456');

      expect(socket.emit).toHaveBeenCalledWith('start-game', {
        pin: '123456'
      });
    });
  });

  describe('submitAnswer', () => {
    it('should emit submit-answer event with answer data', () => {
      gameService.submitAnswer('123456', 1, 'A', 15);

      expect(socket.emit).toHaveBeenCalledWith('submit-answer', {
        pin: '123456',
        userId: 1,
        answer: 'A',
        timeLeft: 15
      });
    });
  });

  describe('nextQuestion', () => {
    it('should emit next-question event', () => {
      gameService.nextQuestion('123456');

      expect(socket.emit).toHaveBeenCalledWith('next-question', {
        pin: '123456'
      });
    });
  });
});
