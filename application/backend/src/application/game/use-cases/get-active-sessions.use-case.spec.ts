import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import type { GameSessionRepository } from '../../../domain/game/ports/game-session.repository';
import { createGameSessionFixture } from '../../../test-utils/fixtures/unit';
import { createGameSessionRepositoryMock } from '../../../test-utils/mock-factories';
import { GetActiveSessionsUseCase } from './get-active-sessions.use-case';

describe('GetActiveSessionsUseCase', () => {
  let useCase: GetActiveSessionsUseCase;
  let mockGameSessionRepository: GameSessionRepository;

  beforeEach(() => {
    mockGameSessionRepository = createGameSessionRepositoryMock();

    useCase = new GetActiveSessionsUseCase(mockGameSessionRepository);
  });

  describe('execute', () => {
    it('should return all active sessions for a host', async () => {
      const mockSessions = [
        createGameSessionFixture({
          status: GameSessionStatus.ACTIVE,
        }),
        createGameSessionFixture({
          id: 2,
          status: GameSessionStatus.PAUSED,
        }),
      ];

      vi.spyOn(mockGameSessionRepository, 'findActiveByHostId').mockResolvedValue(mockSessions);

      const result = await useCase.execute(100);

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe(GameSessionStatus.ACTIVE);
      expect(result[1].status).toBe(GameSessionStatus.PAUSED);
      expect(mockGameSessionRepository.findActiveByHostId).toHaveBeenCalledWith(100);
    });

    it('should return empty array when host has no active sessions', async () => {
      vi.spyOn(mockGameSessionRepository, 'findActiveByHostId').mockResolvedValue([]);

      const result = await useCase.execute(100);

      expect(result).toHaveLength(0);
      expect(mockGameSessionRepository.findActiveByHostId).toHaveBeenCalledWith(100);
    });

    it('should only return waiting, active, and paused sessions', async () => {
      const mockSessions = [
        createGameSessionFixture({
          status: GameSessionStatus.WAITING,
        }),
        createGameSessionFixture({
          id: 2,
          status: GameSessionStatus.ACTIVE,
        }),
        createGameSessionFixture({
          id: 3,
          status: GameSessionStatus.PAUSED,
        }),
      ];

      vi.spyOn(mockGameSessionRepository, 'findActiveByHostId').mockResolvedValue(mockSessions);

      const result = await useCase.execute(100);

      expect(result).toHaveLength(3);
      expect(
        result.every((s) =>
          [GameSessionStatus.WAITING, GameSessionStatus.ACTIVE, GameSessionStatus.PAUSED].includes(
            s.status,
          ),
        ),
      ).toBe(true);
    });
  });
});
