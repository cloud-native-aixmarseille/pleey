import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { GameType } from '../../../../../domain/game/enums/game-type.enum';
import { createGameSessionFixture } from '../../../../../test-utils/fixtures/unit/game-session.fixture';
import { createGamePauseHandlerMock } from '../../../../../test-utils/mock-factories/game-pause-handler.mock-factory';
import { createGamePauseHandlerRegistryMock } from '../../../../../test-utils/mock-factories/game-pause-handler-registry.mock-factory';
import { createGameRepositoryMock } from '../../../../../test-utils/mock-factories/game-repository.mock-factory';
import { createGameSessionRepositoryMock } from '../../../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { createGameSessionStateServiceMock } from '../../../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { HostStageControlContextService } from '../services/host-stage-control-context-service';
import { PauseGameUseCase } from './pause-game-use-case';

describe('PauseGameUseCase', () => {
  it('throws when hostId does not match', async () => {
    const state = { pause: vi.fn().mockReturnValue(5) };
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: createGameSessionFixture({ hostId: 999 }) as never,
    });
    const gameRepository = createGameRepositoryMock();
    const handler = createGamePauseHandlerMock();
    const handlerRegistry = createGamePauseHandlerRegistryMock({ resolve: handler });
    const hostStageControlContextService = new HostStageControlContextService(
      gameSessionStateService as never,
      gameSessionRepository as never,
      gameRepository as never,
    );
    const useCase = new PauseGameUseCase(
      hostStageControlContextService as never,
      handlerRegistry as never,
    );

    await expect(useCase.execute('123456', 1)).rejects.toThrow(
      GameErrorCode.UNAUTHORIZED_SESSION_CONTROL,
    );
  });

  it('resolves handler by game type and delegates', async () => {
    const state = { pause: vi.fn().mockReturnValue(7) };
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: createGameSessionFixture({ gameId: 9 }) as never,
    });
    const gameRepository = createGameRepositoryMock({
      findById: { id: 9, type: GameType.QUIZ } as never,
    });
    const handler = createGamePauseHandlerMock();
    const handlerRegistry = createGamePauseHandlerRegistryMock({ resolve: handler });
    const hostStageControlContextService = new HostStageControlContextService(
      gameSessionStateService as never,
      gameSessionRepository as never,
      gameRepository as never,
    );
    const useCase = new PauseGameUseCase(
      hostStageControlContextService as never,
      handlerRegistry as never,
    );

    await useCase.execute('123456', 1);
    expect(handlerRegistry.resolve).toHaveBeenCalledWith(GameType.QUIZ);
    expect(handler.pause).toHaveBeenCalledWith(
      expect.objectContaining({
        pin: '123456',
        state,
        session: expect.objectContaining({ id: 1 }),
      }),
    );
  });
});
