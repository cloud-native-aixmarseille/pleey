import { WsException } from '@nestjs/websockets';
import { describe, expect, it } from 'vitest';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import {
  createGameSessionFixture,
  createGameSessionStateFixture,
  createPlayerScoreFixture,
} from '../../../test-utils/fixtures/unit';
import {
  createGameBroadcastServiceMock,
  createGameSessionRepositoryMock,
  createGameSessionStateServiceMock,
  createGameTimerServiceMock,
} from '../../../test-utils/mock-factories';
import { GameBroadcastEventType } from '../ports';
import { EndGameUseCase } from './end-game.use-case';

describe('EndGameUseCase', () => {
  it('throws UNAUTHORIZED_SESSION_CONTROL when hostId does not match', async () => {
    const state = createGameSessionStateFixture();
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      remove: undefined,
    });
    const session = createGameSessionFixture({ id: 1, hostId: 999 });
    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: session,
    });
    const timerService = createGameTimerServiceMock();
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new EndGameUseCase(
      gameSessionStateService as never,
      gameSessionRepository as never,
      timerService as never,
      broadcastService as never,
    );

    await expect(useCase.execute({ pin: '123456', hostId: 1 })).rejects.toBeInstanceOf(WsException);

    try {
      await useCase.execute({ pin: '123456', hostId: 1 });
    } catch (error) {
      expect((error as WsException).getError()).toBe(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
    }
  });

  it('ends the game, clears timers, broadcasts and removes state', async () => {
    const scores = [createPlayerScoreFixture()];
    const state = createGameSessionStateFixture({ scores });
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      remove: undefined,
    });
    const session = createGameSessionFixture({
      id: 1,
      hostId: 1,
      status: GameSessionStatus.ACTIVE,
    });
    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: session,
      updateStatus: undefined,
    });
    const timerService = createGameTimerServiceMock();
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new EndGameUseCase(
      gameSessionStateService as never,
      gameSessionRepository as never,
      timerService as never,
      broadcastService as never,
    );

    await useCase.execute({ pin: '123456', hostId: 1 });

    expect(timerService.clearAnswerRevealTimer).toHaveBeenCalledWith('123456');
    expect(gameSessionRepository.updateStatus).toHaveBeenCalledWith(1, GameSessionStatus.ENDED);
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: GameBroadcastEventType.GAME_ENDED, pin: '123456' }),
    );
    expect(gameSessionStateService.remove).toHaveBeenCalledWith('123456');
  });
});
