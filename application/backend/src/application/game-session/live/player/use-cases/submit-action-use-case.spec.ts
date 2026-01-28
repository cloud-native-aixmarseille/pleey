import { beforeEach, describe, expect, it } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { GameType } from '../../../../../domain/game/enums/game-type.enum';
import { createSubmitGameActionDtoFixture } from '../../../../../test-utils/fixtures/unit/submit-game-action-dto.fixture';
import { createGameSessionPinContextServiceMock } from '../../../../../test-utils/mock-factories/game-session-pin-context-service.mock-factory';
import { createGameSubmitActionHandlerMock } from '../../../../../test-utils/mock-factories/game-submit-action-handler.mock-factory';
import { createGameSubmitActionHandlerRegistryMock } from '../../../../../test-utils/mock-factories/game-submit-action-handler-registry.mock-factory';
import { SubmitActionUseCase } from './submit-action-use-case';

describe('SubmitActionUseCase', () => {
  let useCase: SubmitActionUseCase;
  let mockGameSessionPinContextService: ReturnType<typeof createGameSessionPinContextServiceMock>;
  let mockHandlerRegistry: ReturnType<typeof createGameSubmitActionHandlerRegistryMock>;
  let mockHandler: ReturnType<typeof createGameSubmitActionHandlerMock>;

  beforeEach(() => {
    mockGameSessionPinContextService = createGameSessionPinContextServiceMock();
    mockHandler = createGameSubmitActionHandlerMock();
    mockHandlerRegistry = createGameSubmitActionHandlerRegistryMock({ resolve: mockHandler });

    useCase = new SubmitActionUseCase(
      mockGameSessionPinContextService as never,
      mockHandlerRegistry as never,
    );
  });

  it('throws when session is not found', async () => {
    mockGameSessionPinContextService.load.mockRejectedValue(
      new Error(GameErrorCode.GAME_SESSION_NOT_FOUND),
    );

    await expect(useCase.execute(createSubmitGameActionDtoFixture())).rejects.toThrow(
      GameErrorCode.GAME_SESSION_NOT_FOUND,
    );
    expect(mockHandlerRegistry.resolve).not.toHaveBeenCalled();
  });

  it('resolves handler by game type and delegates', async () => {
    const state = { sessionId: 1 };
    const session = {
      id: 1,
      gameId: 9,
    };
    mockGameSessionPinContextService.load.mockResolvedValue({
      state: state as never,
      session: session as never,
      game: { id: 9, type: GameType.QUIZ } as never,
    });
    mockHandler.submit.mockResolvedValue({
      isCorrect: true,
      points: 100,
      correctActionIds: [1],
    });

    const result = await useCase.execute(createSubmitGameActionDtoFixture(), 'socket-1');

    expect(mockHandlerRegistry.resolve).toHaveBeenCalledWith(GameType.QUIZ);
    expect(mockHandler.submit).toHaveBeenCalledWith(
      expect.objectContaining({
        pin: '123456',
        state,
        session,
        gameType: GameType.QUIZ,
        connectionId: 'socket-1',
      }),
    );
    expect(result).toEqual({ isCorrect: true, points: 100, correctActionIds: [1] });
  });
});
