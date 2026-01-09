import { WsException } from '@nestjs/websockets';
import { describe, expect, it, vi } from 'vitest';
import {
  createGameBroadcastServiceMock,
  createGameSessionRepositoryMock,
  createGameTimerServiceMock,
  createSessionStateRepositoryMock,
} from '../../../test-utils/mock-factories';
import { GameErrorCode } from '../enums/game-error-code.enum';
import { PauseGameWsUseCase } from './pause-game-ws.use-case';

describe('PauseGameWsUseCase', () => {
  it('throws when hostId does not match', async () => {
    const state = { pause: vi.fn().mockReturnValue(5) };
    const sessionStateRepository = createSessionStateRepositoryMock({
      getOrCreate: state as never,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: { id: 1, hostId: 999 } as never,
    });
    const timerService = createGameTimerServiceMock();
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new PauseGameWsUseCase(
      sessionStateRepository as never,
      gameSessionRepository as never,
      timerService as never,
      broadcastService as never,
    );

    await expect(useCase.execute('123456', 1)).rejects.toBeInstanceOf(WsException);
    try {
      await useCase.execute('123456', 1);
    } catch (error) {
      expect((error as WsException).getError()).toBe(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
    }
  });

  it('clears timer, updates status and broadcasts remaining time', async () => {
    const state = { pause: vi.fn().mockReturnValue(7) };
    const sessionStateRepository = createSessionStateRepositoryMock({
      getOrCreate: state as never,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: { id: 1, hostId: 1 } as never,
      updateStatus: undefined,
    });
    const timerService = createGameTimerServiceMock();
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new PauseGameWsUseCase(
      sessionStateRepository as never,
      gameSessionRepository as never,
      timerService as never,
      broadcastService as never,
    );

    await useCase.execute('123456', 1);

    expect(timerService.clearAnswerRevealTimer).toHaveBeenCalledWith('123456');
    expect(gameSessionRepository.updateStatus).toHaveBeenCalledWith(1, 'paused');
    expect(broadcastService.publish).toHaveBeenCalledWith({
      type: 'game-paused',
      pin: '123456',
      timeLeft: 7,
    });
  });
});
