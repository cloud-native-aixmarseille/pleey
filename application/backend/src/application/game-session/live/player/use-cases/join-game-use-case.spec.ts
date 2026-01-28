import { describe, expect, it } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { GameType } from '../../../../../domain/game/enums/game-type.enum';
import { createJoinGameDtoFixture } from '../../../../../test-utils/fixtures/unit/join-game-dto.fixture';
import { createJoinGameSessionStateFixture } from '../../../../../test-utils/fixtures/unit/join-game-session-state.fixture';
import { createGameJoinHandlerMock } from '../../../../../test-utils/mock-factories/game-join-handler.mock-factory';
import { createGameJoinHandlerRegistryMock } from '../../../../../test-utils/mock-factories/game-join-handler-registry.mock-factory';
import { createGameSessionPinContextServiceMock } from '../../../../../test-utils/mock-factories/game-session-pin-context-service.mock-factory';
import { createGameSessionStateServiceMock } from '../../../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { JoinGameUseCase } from './join-game-use-case';

describe('JoinGameUseCase', () => {
  it('throws when session is not found', async () => {
    const gameSessionPinContextService = createGameSessionPinContextServiceMock();
    gameSessionPinContextService.load.mockRejectedValue(
      new Error(GameErrorCode.GAME_SESSION_NOT_FOUND),
    );
    const handlerRegistry = createGameJoinHandlerRegistryMock();
    const useCase = new JoinGameUseCase(
      gameSessionPinContextService as never,
      handlerRegistry as never,
    );

    const dto = createJoinGameDtoFixture();

    await expect(useCase.execute('socket-1', dto)).rejects.toThrow(
      GameErrorCode.GAME_SESSION_NOT_FOUND,
    );
    expect(handlerRegistry.resolve).not.toHaveBeenCalled();
  });

  it('resolves handler by game type and delegates', async () => {
    const state = createJoinGameSessionStateFixture();
    const session = { id: 1, gameId: 9 };
    const gameSessionPinContextService = createGameSessionPinContextServiceMock({
      load: { state, session, game: { id: 9, type: GameType.QUIZ } } as never,
    });
    const gameSessionStateService = createGameSessionStateServiceMock();
    const handler = createGameJoinHandlerMock();
    const handlerRegistry = createGameJoinHandlerRegistryMock({ resolve: handler });
    const useCase = new JoinGameUseCase(
      gameSessionPinContextService as never,
      gameSessionStateService as never,
      handlerRegistry as never,
    );

    const dto = createJoinGameDtoFixture();
    await useCase.execute('socket-1', dto);

    expect(handlerRegistry.resolve).toHaveBeenCalledWith(GameType.QUIZ);
    expect(handler.join).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionId: 'socket-1',
        pin: '123456',
        state,
        session,
      }),
    );
  });

  it('rejects authenticated joins when the player already belongs to another session', async () => {
    const gameSessionPinContextService = createGameSessionPinContextServiceMock();
    const gameSessionStateService = createGameSessionStateServiceMock({
      findPinByUserId: 'AB12CD',
    });
    const handlerRegistry = createGameJoinHandlerRegistryMock();
    const useCase = new JoinGameUseCase(
      gameSessionPinContextService as never,
      gameSessionStateService as never,
      handlerRegistry as never,
    );

    const dto = createJoinGameDtoFixture({ pin: 'ZX90YU', userId: 7, guestId: undefined });

    await expect(useCase.execute('socket-1', dto)).rejects.toThrow(
      GameErrorCode.ACTIVE_SESSION_EXISTS,
    );
    expect(gameSessionPinContextService.load).not.toHaveBeenCalled();
  });

  it('stores the authenticated player active pin after a successful join', async () => {
    const state = createJoinGameSessionStateFixture();
    const session = { id: 1, gameId: 9 };
    const gameSessionPinContextService = createGameSessionPinContextServiceMock({
      load: { state, session, game: { id: 9, type: GameType.QUIZ } } as never,
    });
    const gameSessionStateService = createGameSessionStateServiceMock();
    const handler = createGameJoinHandlerMock();
    const handlerRegistry = createGameJoinHandlerRegistryMock({ resolve: handler });
    const useCase = new JoinGameUseCase(
      gameSessionPinContextService as never,
      gameSessionStateService as never,
      handlerRegistry as never,
    );

    const dto = createJoinGameDtoFixture({ userId: 7, guestId: undefined });

    await useCase.execute('socket-1', dto);

    expect(gameSessionStateService.savePinByUserId).toHaveBeenCalledWith(7, '123456');
  });
});
