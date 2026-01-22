import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import type { GameSessionRepository } from '../../../domain/game/ports/game-session.repository';
import { createGameSessionFixture } from '../../../test-utils/fixtures/unit';
import { createGameSessionRepositoryMock } from '../../../test-utils/mock-factories';
import { StopGameSessionUseCase } from './stop-game-session.use-case';

describe('StopGameSessionUseCase', () => {
  let useCase: StopGameSessionUseCase;
  let mockGameSessionRepository: GameSessionRepository;

  beforeEach(() => {
    mockGameSessionRepository = createGameSessionRepositoryMock();

    useCase = new StopGameSessionUseCase(mockGameSessionRepository);
  });

  describe('execute', () => {
    it('should pause an active game session successfully', async () => {
      const mockSession = createGameSessionFixture({
        hostId: 100,
        status: GameSessionStatus.ACTIVE,
      });
      const pausedSession = createGameSessionFixture({
        hostId: 100,
        status: GameSessionStatus.PAUSED,
      });

      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(mockSession);
      vi.spyOn(mockGameSessionRepository, 'updateStatus').mockResolvedValue(pausedSession);

      const result = await useCase.execute(1, 100);

      expect(result.status).toBe(GameSessionStatus.PAUSED);
      expect(mockGameSessionRepository.updateStatus).toHaveBeenCalledWith(
        1,
        GameSessionStatus.PAUSED,
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
        status: GameSessionStatus.ACTIVE,
      });

      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(mockSession);

      await expect(
        useCase.execute(1, 999), // Different admin
      ).rejects.toThrow(ForbiddenException);

      expect(mockGameSessionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw error when trying to pause non-active session', async () => {
      const mockSession = createGameSessionFixture({
        hostId: 100,
        status: GameSessionStatus.WAITING,
      });

      vi.spyOn(mockGameSessionRepository, 'findById').mockResolvedValue(mockSession);

      await expect(useCase.execute(1, 100)).rejects.toThrow('CAN_ONLY_PAUSE_ACTIVE_GAME');
    });
  });
});
