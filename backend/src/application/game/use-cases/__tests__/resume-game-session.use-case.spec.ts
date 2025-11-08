import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ResumeGameSessionUseCase } from '../resume-game-session.use-case';
import type { GameSessionRepository } from '../../../../domain/game/repositories/game-session.repository.interface';
import { GameSession } from '../../../../domain/game/entities/game-session.entity';

describe('ResumeGameSessionUseCase', () => {
  let useCase: ResumeGameSessionUseCase;
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

    useCase = new ResumeGameSessionUseCase(mockGameSessionRepository);
  });

  describe('execute', () => {
    it('should resume a paused game session successfully', async () => {
      const mockSession = new GameSession(1, 10, 100, 1, '123456', 'paused', 2, new Date());
      const resumedSession = new GameSession(1, 10, 100, 1, '123456', 'active', 2, new Date());

      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(mockSession);
      vi.spyOn(mockGameSessionRepository, 'updateStatus').mockResolvedValue(resumedSession);

      const result = await useCase.execute(1, 100);

      expect(result.status).toBe('active');
      expect(mockGameSessionRepository.updateStatus).toHaveBeenCalledWith(1, 'active');
    });

    it('should throw NotFoundException when session does not exist', async () => {
      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(null);

      await expect(
        useCase.execute(999, 100)
      ).rejects.toThrow(NotFoundException);

      expect(mockGameSessionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when admin does not own the session', async () => {
      const mockSession = new GameSession(1, 10, 100, 1, '123456', 'paused', 2, new Date());

      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(mockSession);

      await expect(
        useCase.execute(1, 999) // Different admin
      ).rejects.toThrow(ForbiddenException);

      expect(mockGameSessionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw error when trying to resume non-paused session', async () => {
      const mockSession = new GameSession(1, 10, 100, 1, '123456', 'waiting', 0, new Date());

      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(mockSession);

      await expect(
        useCase.execute(1, 100)
      ).rejects.toThrow('CAN_ONLY_RESUME_PAUSED_GAME');
    });

    it('should throw error when trying to resume ended session', async () => {
      const mockSession = new GameSession(1, 10, 100, 1, '123456', 'ended', 5, new Date());

      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(mockSession);

      await expect(
        useCase.execute(1, 100)
      ).rejects.toThrow('CAN_ONLY_RESUME_PAUSED_GAME');
    });
  });
});
