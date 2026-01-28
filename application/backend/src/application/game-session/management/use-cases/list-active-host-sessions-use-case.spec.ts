import { beforeEach, describe, expect, it } from 'vitest';
import { GameSessionStatus } from '../../../../domain/game/enums/game-session-status.enum';
import { createGameSessionFixture } from '../../../../test-utils/fixtures/unit/game-session.fixture';
import { createGameSessionRepositoryMock } from '../../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { ListActiveHostSessionsUseCase } from './list-active-host-sessions-use-case';

describe('ListActiveHostSessionsUseCase', () => {
  let useCase: ListActiveHostSessionsUseCase;
  let mockGameSessionRepository: ReturnType<typeof createGameSessionRepositoryMock>;

  beforeEach(() => {
    mockGameSessionRepository = createGameSessionRepositoryMock();
    useCase = new ListActiveHostSessionsUseCase(mockGameSessionRepository);
  });

  describe('execute', () => {
    it('should return all active sessions for a host', async () => {
      const mockSessions = [
        createGameSessionFixture({ status: GameSessionStatus.ACTIVE }),
        createGameSessionFixture({ status: GameSessionStatus.PAUSED }),
      ];

      mockGameSessionRepository.findActiveByHostId.mockResolvedValue(mockSessions);

      const result = await useCase.execute(100);

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe(GameSessionStatus.ACTIVE);
      expect(result[1].status).toBe(GameSessionStatus.PAUSED);
      expect(mockGameSessionRepository.findActiveByHostId).toHaveBeenCalledWith(100);
    });

    it('should return empty array when host has no active sessions', async () => {
      mockGameSessionRepository.findActiveByHostId.mockResolvedValue([]);

      const result = await useCase.execute(100);

      expect(result).toHaveLength(0);
      expect(mockGameSessionRepository.findActiveByHostId).toHaveBeenCalledWith(100);
    });

    it('should only return waiting, active, and paused sessions', async () => {
      const mockSessions = [
        createGameSessionFixture(),
        createGameSessionFixture({ status: GameSessionStatus.ACTIVE }),
        createGameSessionFixture({ status: GameSessionStatus.PAUSED }),
      ];

      mockGameSessionRepository.findActiveByHostId.mockResolvedValue(mockSessions);

      const result = await useCase.execute(100);

      expect(result).toHaveLength(3);
      expect(
        result.every((session) =>
          [GameSessionStatus.WAITING, GameSessionStatus.ACTIVE, GameSessionStatus.PAUSED].includes(
            session.status,
          ),
        ),
      ).toBe(true);
    });
  });
});
