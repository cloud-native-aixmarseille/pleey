import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../../../domain/game/enums/game-session-status.enum';
import { GameType } from '../../../../domain/game/enums/game-type.enum';
import { createGameSessionFixture } from '../../../../test-utils/fixtures/unit/game-session.fixture';
import { createGameRepositoryMock } from '../../../../test-utils/mock-factories/game-repository.mock-factory';
import { createGameResumeSessionHandlerMock } from '../../../../test-utils/mock-factories/game-resume-session-handler.mock-factory';
import { createGameResumeSessionHandlerRegistryMock } from '../../../../test-utils/mock-factories/game-resume-session-handler-registry.mock-factory';
import { createGameSessionRepositoryMock } from '../../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { ResumeHostSessionUseCase } from './resume-host-session-use-case';

describe('ResumeHostSessionUseCase', () => {
  let useCase: ResumeHostSessionUseCase;
  let mockGameSessionRepository: ReturnType<typeof createGameSessionRepositoryMock>;
  let mockGameRepository: ReturnType<typeof createGameRepositoryMock>;
  let handlerRegistry: ReturnType<typeof createGameResumeSessionHandlerRegistryMock>;
  let handler: ReturnType<typeof createGameResumeSessionHandlerMock>;

  beforeEach(() => {
    mockGameSessionRepository = createGameSessionRepositoryMock();
    mockGameRepository = createGameRepositoryMock();
    handler = createGameResumeSessionHandlerMock();
    handlerRegistry = createGameResumeSessionHandlerRegistryMock({ resolve: handler });

    useCase = new ResumeHostSessionUseCase(
      mockGameSessionRepository,
      mockGameRepository as never,
      handlerRegistry as never,
    );
  });

  describe('execute', () => {
    it('should resume a paused game session successfully', async () => {
      const mockSession = createGameSessionFixture({ gameId: 9 });
      const resumedSession = createGameSessionFixture();

      mockGameSessionRepository.findById.mockResolvedValue(mockSession);
      mockGameRepository.findById.mockResolvedValue({ id: 9, type: GameType.QUIZ } as never);
      handler.resumeSession.mockResolvedValue(resumedSession);

      const result = await useCase.execute(1, 1);

      expect(handlerRegistry.resolve).toHaveBeenCalledWith(GameType.QUIZ);
      expect(handler.resumeSession).toHaveBeenCalledWith(
        expect.objectContaining({ session: mockSession, sessionId: 1, hostId: 1 }),
      );
      expect(result).toBe(resumedSession);
    });

    it('should throw when session does not exist', async () => {
      mockGameSessionRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(999, 100)).rejects.toThrow(GameErrorCode.GAME_SESSION_NOT_FOUND);

      expect(mockGameSessionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw when host does not own the session', async () => {
      const mockSession = createGameSessionFixture({ status: GameSessionStatus.PAUSED });

      mockGameSessionRepository.findById.mockResolvedValue(mockSession);

      await expect(useCase.execute(1, 2)).rejects.toThrow(
        GameErrorCode.UNAUTHORIZED_SESSION_CONTROL,
      );

      expect(mockGameSessionRepository.updateStatus).not.toHaveBeenCalled();
    });

    it('should throw when game does not exist', async () => {
      const mockSession = createGameSessionFixture({ gameId: 9 });

      mockGameSessionRepository.findById.mockResolvedValue(mockSession);
      mockGameRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(1, 1)).rejects.toThrow(GameErrorCode.GAME_NOT_FOUND);
    });
  });
});
