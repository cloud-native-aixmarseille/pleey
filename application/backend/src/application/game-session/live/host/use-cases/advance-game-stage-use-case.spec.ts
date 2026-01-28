import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { GameType } from '../../../../../domain/game/enums/game-type.enum';
import { createGameSessionStateFixture } from '../../../../../test-utils/fixtures/unit/game-session-state.fixture';
import { createGameNextStageHandlerMock } from '../../../../../test-utils/mock-factories/game-next-stage-handler.mock-factory';
import { createGameNextStageHandlerRegistryMock } from '../../../../../test-utils/mock-factories/game-next-stage-handler-registry.mock-factory';
import type { HostStageControlContextService } from '../services/host-stage-control-context-service';
import { AdvanceGameStageUseCase } from './advance-game-stage-use-case';

describe('AdvanceGameStageUseCase', () => {
  it('throws when session is not found', async () => {
    const hostStageControlContextService = {
      load: vi.fn().mockRejectedValue(new Error(GameErrorCode.GAME_SESSION_NOT_FOUND)),
      loadGame: vi.fn(),
    } as unknown as HostStageControlContextService;
    const handler = createGameNextStageHandlerMock();
    const handlerRegistry = createGameNextStageHandlerRegistryMock({ resolve: handler });

    const useCase = new AdvanceGameStageUseCase(
      hostStageControlContextService as never,
      handlerRegistry as never,
    );

    await expect(useCase.execute('123456', 7)).rejects.toThrow(
      GameErrorCode.GAME_SESSION_NOT_FOUND,
    );
    expect(handlerRegistry.resolve).not.toHaveBeenCalled();
  });

  it('resolves handler by game type and delegates', async () => {
    const state = createGameSessionStateFixture();
    const session = { id: 1, gameId: 9 };
    const hostStageControlContextService = {
      load: vi.fn().mockResolvedValue({ state, session }),
      loadGame: vi.fn().mockResolvedValue({ id: 9, type: GameType.QUIZ }),
    } as unknown as HostStageControlContextService;
    const handler = createGameNextStageHandlerMock();
    const handlerRegistry = createGameNextStageHandlerRegistryMock({ resolve: handler });

    const useCase = new AdvanceGameStageUseCase(
      hostStageControlContextService as never,
      handlerRegistry as never,
    );

    await useCase.execute('123456', 7);
    expect(handlerRegistry.resolve).toHaveBeenCalledWith(GameType.QUIZ);
    expect(hostStageControlContextService.load).toHaveBeenCalledWith('123456', 7);
    expect(hostStageControlContextService.loadGame).toHaveBeenCalledWith(9);
    expect(handler.nextStage).toHaveBeenCalledWith(
      expect.objectContaining({ pin: '123456', state, session }),
    );
  });
});
