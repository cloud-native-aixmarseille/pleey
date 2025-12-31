import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSession } from '../../../../domain/game/entities/game-session.entity';
import type { GameSessionRepository } from '../../../../domain/game/repositories/game-session.repository.interface';
import { GetActiveSessionsUseCase } from '../get-active-sessions.use-case';

describe('GetActiveSessionsUseCase', () => {
  let useCase: GetActiveSessionsUseCase;
  let mockGameSessionRepository: GameSessionRepository;

  beforeEach(() => {
    mockGameSessionRepository = {
      create: vi.fn(),
      findByPin: vi.fn(),
      findById: vi.fn(),
      findActiveByAdminId: vi.fn(),
      findActiveByQuizId: vi.fn(),
      findByQuizId: vi.fn(),
      updateStatus: vi.fn(),
      updateCurrentQuestion: vi.fn(),
      countActiveByQuizId: vi.fn(),
      deleteOldSessions: vi.fn(),
      findByOrganization: vi.fn(),
    };

    useCase = new GetActiveSessionsUseCase(mockGameSessionRepository);
  });

  describe('execute', () => {
    it('should return all active sessions for an admin', async () => {
      const mockSessions = [
        new GameSession(1, 10, 100, 1, '123456', 'active', 2, new Date()),
        new GameSession(2, 11, 100, 1, '789012', 'paused', 1, new Date()),
      ];

      vi.spyOn(mockGameSessionRepository, 'findActiveByAdminId').mockResolvedValue(mockSessions);

      const result = await useCase.execute(100);

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('active');
      expect(result[1].status).toBe('paused');
      expect(mockGameSessionRepository.findActiveByAdminId).toHaveBeenCalledWith(100);
    });

    it('should return empty array when admin has no active sessions', async () => {
      vi.spyOn(mockGameSessionRepository, 'findActiveByAdminId').mockResolvedValue([]);

      const result = await useCase.execute(100);

      expect(result).toHaveLength(0);
      expect(mockGameSessionRepository.findActiveByAdminId).toHaveBeenCalledWith(100);
    });

    it('should only return waiting, active, and paused sessions', async () => {
      const mockSessions = [
        new GameSession(1, 10, 100, 1, '123456', 'waiting', 0, new Date()),
        new GameSession(2, 11, 100, 1, '789012', 'active', 2, new Date()),
        new GameSession(3, 12, 100, 1, '345678', 'paused', 1, new Date()),
      ];

      vi.spyOn(mockGameSessionRepository, 'findActiveByAdminId').mockResolvedValue(mockSessions);

      const result = await useCase.execute(100);

      expect(result).toHaveLength(3);
      expect(result.every((s) => ['waiting', 'active', 'paused'].includes(s.status))).toBe(true);
    });
  });
});
