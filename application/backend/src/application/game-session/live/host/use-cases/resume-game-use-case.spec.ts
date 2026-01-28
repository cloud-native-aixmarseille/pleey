import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { GameType } from '../../../../../domain/game/enums/game-type.enum';
import { createGameSessionFixture } from '../../../../../test-utils/fixtures/unit/game-session.fixture';
import { createGameSessionStateFixture } from '../../../../../test-utils/fixtures/unit/game-session-state.fixture';
import { createGameRepositoryMock } from '../../../../../test-utils/mock-factories/game-repository.mock-factory';
import { createGameResumeHandlerMock } from '../../../../../test-utils/mock-factories/game-resume-handler.mock-factory';
import { createGameResumeHandlerRegistryMock } from '../../../../../test-utils/mock-factories/game-resume-handler-registry.mock-factory';
import { createGameSessionRepositoryMock } from '../../../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { createGameSessionStateServiceMock } from '../../../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { HostStageControlContextService } from '../services/host-stage-control-context-service';
import { ResumeGameUseCase } from './resume-game-use-case';

describe('ResumeGameUseCase', () => {
  it('throws when session is not found', async () => {
    const state = createGameSessionStateFixture();
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({ findByPin: null });
    const gameRepository = createGameRepositoryMock();
    const handler = createGameResumeHandlerMock();
    const handlerRegistry = createGameResumeHandlerRegistryMock({ resolve: handler });
    const hostStageControlContextService = new HostStageControlContextService(
      gameSessionStateService as never,
      gameSessionRepository as never,
      gameRepository as never,
    );

    const useCase = new ResumeGameUseCase(
      hostStageControlContextService as never,
      handlerRegistry as never,
    );

    await expect(useCase.execute('123456', 1)).rejects.toThrow(
      GameErrorCode.GAME_SESSION_NOT_FOUND,
    );
  });

  it('resolves handler by game type and delegates', async () => {
    const state = createGameSessionStateFixture({ resume: vi.fn().mockReturnValue(5) });
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: createGameSessionFixture() as never,
    });
    const gameRepository = createGameRepositoryMock({
      findById: { id: 1, type: GameType.QUIZ } as never,
    });
    const handler = createGameResumeHandlerMock();
    const handlerRegistry = createGameResumeHandlerRegistryMock({ resolve: handler });
    const hostStageControlContextService = new HostStageControlContextService(
      gameSessionStateService as never,
      gameSessionRepository as never,
      gameRepository as never,
    );

    const useCase = new ResumeGameUseCase(
      hostStageControlContextService as never,
      handlerRegistry as never,
    );

    await useCase.execute('123456', 1);
    expect(handlerRegistry.resolve).toHaveBeenCalledWith(GameType.QUIZ);
    expect(handler.resume).toHaveBeenCalledWith(
      expect.objectContaining({
        pin: '123456',
        state,
        session: expect.objectContaining({ id: 1 }),
      }),
    );
  });
});
