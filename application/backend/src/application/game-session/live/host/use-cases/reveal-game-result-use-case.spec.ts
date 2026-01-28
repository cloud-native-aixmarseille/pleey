import { describe, expect, it, vi } from 'vitest';
import { GameType } from '../../../../../domain/game/enums/game-type.enum';
import { createGameStageFixture } from '../../../../../test-utils/fixtures/unit/game-stage.fixture';
import { createGameRevealResultHandlerMock } from '../../../../../test-utils/mock-factories/game-reveal-result-handler.mock-factory';
import { createGameRevealResultHandlerRegistryMock } from '../../../../../test-utils/mock-factories/game-reveal-result-handler-registry.mock-factory';
import { createGameSessionPinContextServiceMock } from '../../../../../test-utils/mock-factories/game-session-pin-context-service.mock-factory';
import { RevealGameResultUseCase } from './reveal-game-result-use-case';

describe('RevealGameResultUseCase', () => {
  it('no-ops when session state does not exist', async () => {
    const gameSessionPinContextService = createGameSessionPinContextServiceMock({
      loadExisting: undefined,
    });
    const handler = createGameRevealResultHandlerMock();
    const handlerRegistry = createGameRevealResultHandlerRegistryMock();

    handlerRegistry.resolve.mockReturnValue(handler);

    const useCase = new RevealGameResultUseCase(
      gameSessionPinContextService as never,
      handlerRegistry as never,
    );

    await useCase.execute('123456');
    expect(handlerRegistry.resolve).not.toHaveBeenCalled();
  });

  it('resolves handler by game type and delegates', async () => {
    const state = {
      actionCount: 1,
      currentStage: createGameStageFixture(),
      getAllActions: () => [
        { playerId: 'user-1', actionId: 1, isCorrect: true, points: 1000, timeLeft: 5 },
      ],
      getPlayerEntries: () => new Map([['socket-1', { playerId: 'user-1' }]]).entries(),
      getAction: vi.fn().mockReturnValue({ isCorrect: true, points: 1000 }),
      getScoresExcludingHost: () => [
        { playerId: 'user-1', userId: 1, username: 'alice', totalPoints: 1000 },
      ],
      getCorrectActionIds: () => [1],
    };
    const session = { id: 1, gameId: 9 };

    const gameSessionPinContextService = createGameSessionPinContextServiceMock({
      loadExisting: { state, session, game: { id: 9, type: GameType.QUIZ } } as never,
    });
    const handler = createGameRevealResultHandlerMock();
    const handlerRegistry = createGameRevealResultHandlerRegistryMock();

    handlerRegistry.resolve.mockReturnValue(handler);

    const useCase = new RevealGameResultUseCase(
      gameSessionPinContextService as never,
      handlerRegistry as never,
    );

    await useCase.execute('123456');
    expect(handlerRegistry.resolve).toHaveBeenCalledWith(GameType.QUIZ);
    expect(handler.reveal).toHaveBeenCalledWith(
      expect.objectContaining({ pin: '123456', state, session }),
    );
  });
});
