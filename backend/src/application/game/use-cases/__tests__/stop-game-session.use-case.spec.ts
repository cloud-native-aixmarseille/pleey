import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { StopGameSessionUseCase } from '../stop-game-session.use-case';
import type { GameSessionRepository } from '../../../../domain/game/repositories/game-session.repository.interface';
import { GameSession } from '../../../../domain/game/entities/game-session.entity';

describe('StopGameSessionUseCase', () => {
  let useCase: StopGameSessionUseCase;
  let mockGameSessionRepository: GameSessionRepository;

  beforeEach(() => {
    mockGameSessionRepository = {
      create: vi.fn(),
      findByPin: vi.fn(),
      findById: vi.fn(),
      findActiveByAdminId: vi.fn(),
      updateStatus: vi.fn(),
      updateCurrentQuestion: vi.fn(),
      deleteOldSessions: vi.fn(),
    };

    useCase = new StopGameSessionUseCase(mockGameSessionRepository);
  });

  describe('execute', () => {
    it('should pause an active game session successfully', async () => {
      const mockSession = new GameSession(1, 10, 100, '123456', 'active', 2, new Date());
      const pausedSession = new GameSession(1, 10, 100, '123456', 'paused', 2, new Date());

      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(mockSession);
      vi.spyOn(mockGameSessionRepository, 'updateStatus').mockResolvedValue(pausedSession);

      const result = await useCase.execute(1, 100);

      expect(result.status).toBe('paused');
      expect(mockGameSessionRepository.updateStatus).toHaveBeenCalledWith(1, 'paused');
    });

    it('should throw NotFoundException when session does not exist', async () => {
      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(null);

      await expect(
        useCase.execute(999, 100)
      ).rejects.toThrow(NotFoundException);
      
      expect(mockGameSessionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when admin does not own the session', async () => {
      const mockSession = new GameSession(1, 10, 100, '123456', 'active', 2, new Date());

      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(mockSession);

      await expect(
        useCase.execute(1, 999) // Different admin
      ).rejects.toThrow(ForbiddenException);
      
      expect(mockGameSessionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw error when trying to pause non-active session', async () => {
      const mockSession = new GameSession(1, 10, 100, '123456', 'waiting', 0, new Date());

      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(mockSession);

      await expect(
        useCase.execute(1, 100)
      ).rejects.toThrow('Can only pause an active game');
    });
  });
});
