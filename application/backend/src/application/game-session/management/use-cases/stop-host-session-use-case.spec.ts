import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../../../domain/game/enums/game-session-status.enum';
import { createGameSessionFixture } from '../../../../test-utils/fixtures/unit/game-session.fixture';
import { createGameSessionRepositoryMock } from '../../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { StopHostSessionUseCase } from './stop-host-session-use-case';

describe('StopHostSessionUseCase', () => {
  let useCase: StopHostSessionUseCase;
  let mockGameSessionRepository: ReturnType<typeof createGameSessionRepositoryMock>;

  beforeEach(() => {
    mockGameSessionRepository = createGameSessionRepositoryMock();
    useCase = new StopHostSessionUseCase(mockGameSessionRepository);
  });

  describe('execute', () => {
    it('should pause an active game session successfully', async () => {
      const mockSession = createGameSessionFixture({ status: GameSessionStatus.ACTIVE });
      const pausedSession = createGameSessionFixture({ status: GameSessionStatus.PAUSED });

      mockGameSessionRepository.findById.mockResolvedValue(mockSession);
      mockGameSessionRepository.updateStatus.mockResolvedValue(pausedSession);

      const result = await useCase.execute(1, 1);

      expect(result.status).toBe(GameSessionStatus.PAUSED);
      expect(mockGameSessionRepository.updateStatus).toHaveBeenCalledWith(
        1,
        GameSessionStatus.PAUSED,
      );
    });

    it('should throw when session does not exist', async () => {
      mockGameSessionRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999, 100)).rejects.toThrow(GameErrorCode.GAME_SESSION_NOT_FOUND);

      expect(mockGameSessionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw when host does not own the session', async () => {
      const mockSession = createGameSessionFixture({ status: GameSessionStatus.ACTIVE });

      mockGameSessionRepository.findById.mockResolvedValue(mockSession);

      await expect(useCase.execute(1, 2)).rejects.toThrow(
        GameErrorCode.UNAUTHORIZED_SESSION_CONTROL,
      );

      expect(mockGameSessionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw when trying to pause non-active session', async () => {
      const mockSession = createGameSessionFixture();

      mockGameSessionRepository.findById.mockResolvedValue(mockSession);

      await expect(useCase.execute(1, 1)).rejects.toThrow(GameErrorCode.CAN_ONLY_PAUSE_ACTIVE_GAME);
    });
  });
});
