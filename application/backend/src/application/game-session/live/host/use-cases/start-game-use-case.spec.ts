import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { GameType } from '../../../../../domain/game/enums/game-type.enum';
import { createGameSessionStateFixture } from '../../../../../test-utils/fixtures/unit/game-session-state.fixture';
import { createGameStartHandlerMock } from '../../../../../test-utils/mock-factories/game-start-handler.mock-factory';
import { createGameStartHandlerRegistryMock } from '../../../../../test-utils/mock-factories/game-start-handler-registry.mock-factory';
import type { HostStageControlContextService } from '../services/host-stage-control-context-service';
import { StartGameUseCase } from './start-game-use-case';

describe('StartGameUseCase', () => {
  it('throws when game session is not found', async () => {
    const hostStageControlContextService = {
      load: vi.fn().mockRejectedValue(new Error(GameErrorCode.GAME_SESSION_NOT_FOUND)),
      loadGame: vi.fn(),
    } as unknown as HostStageControlContextService;
    const startHandler = createGameStartHandlerMock();
    const startHandlerRegistry = createGameStartHandlerRegistryMock({ resolve: startHandler });

    const useCase = new StartGameUseCase(
      hostStageControlContextService as never,
      startHandlerRegistry as never,
    );

    await expect(useCase.execute('123456', 7)).rejects.toThrow(
      GameErrorCode.GAME_SESSION_NOT_FOUND,
    );
    expect(startHandlerRegistry.resolve).not.toHaveBeenCalled();
  });

  it('resolves the start handler by game type and delegates', async () => {
    const state = createGameSessionStateFixture({ startFirstStage: vi.fn() });
    const session = { id: 1, gameId: 9 };
    const hostStageControlContextService = {
      load: vi.fn().mockResolvedValue({ state, session }),
      loadGame: vi.fn().mockResolvedValue({ id: 9, type: GameType.QUIZ }),
    } as unknown as HostStageControlContextService;
    const startHandler = createGameStartHandlerMock();
    const startHandlerRegistry = createGameStartHandlerRegistryMock({ resolve: startHandler });

    const useCase = new StartGameUseCase(
      hostStageControlContextService as never,
      startHandlerRegistry as never,
    );

    await useCase.execute('123456', 7);

    expect(startHandlerRegistry.resolve).toHaveBeenCalledWith(GameType.QUIZ);
    expect(hostStageControlContextService.load).toHaveBeenCalledWith('123456', 7);
    expect(hostStageControlContextService.loadGame).toHaveBeenCalledWith(9);
    expect(startHandler.start).toHaveBeenCalledWith(
      expect.objectContaining({ pin: '123456', state, session }),
    );
  });
});
