import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import type { GameSessionRepository } from '../../../domain/game/ports/game-session.repository';
import { createGameSessionFixture } from '../../../test-utils/fixtures/unit';
import { createGameSessionRepositoryMock } from '../../../test-utils/mock-factories';
import { ResumeGameSessionUseCase } from './resume-game-session.use-case';

describe('ResumeGameSessionUseCase', () => {
  let useCase: ResumeGameSessionUseCase;
  let mockGameSessionRepository: GameSessionRepository;

  beforeEach(() => {
    mockGameSessionRepository = createGameSessionRepositoryMock();

    useCase = new ResumeGameSessionUseCase(mockGameSessionRepository);
  });

  describe('execute', () => {
    it('should resume a paused game session successfully', async () => {
      const mockSession = createGameSessionFixture({
        hostId: 100,
        status: GameSessionStatus.PAUSED,
      });
      const resumedSession = createGameSessionFixture({
        hostId: 100,
        status: GameSessionStatus.ACTIVE,
      });

      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(mockSession);
      vi.spyOn(mockGameSessionRepository, 'updateStatus').mockResolvedValue(resumedSession);

      const result = await useCase.execute(1, 100);

      expect(result.status).toBe(GameSessionStatus.ACTIVE);
      expect(mockGameSessionRepository.updateStatus).toHaveBeenCalledWith(
        1,
        GameSessionStatus.ACTIVE,
      );
    });

    it('should throw NotFoundException when session does not exist', async () => {
      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(null);

      await expect(useCase.execute(999, 100)).rejects.toThrow(NotFoundException);

      expect(mockGameSessionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when admin does not own the session', async () => {
      const mockSession = createGameSessionFixture({
        hostId: 100,
        status: GameSessionStatus.PAUSED,
      });

      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(mockSession);

      await expect(
        useCase.execute(1, 999), // Different admin
      ).rejects.toThrow(ForbiddenException);

      expect(mockGameSessionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw error when trying to resume non-paused session', async () => {
      const mockSession = createGameSessionFixture({
        hostId: 100,
        status: GameSessionStatus.WAITING,
      });

      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(mockSession);

      await expect(useCase.execute(1, 100)).rejects.toThrow('CAN_ONLY_RESUME_PAUSED_GAME');
    });

    it('should throw error when trying to resume ended session', async () => {
      const mockSession = createGameSessionFixture({
        hostId: 100,
        status: GameSessionStatus.ENDED,
      });

      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(mockSession);

      await expect(useCase.execute(1, 100)).rejects.toThrow('CAN_ONLY_RESUME_PAUSED_GAME');
    });
  });
});
