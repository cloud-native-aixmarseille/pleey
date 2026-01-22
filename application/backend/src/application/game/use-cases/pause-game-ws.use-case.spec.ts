import { WsException } from '@nestjs/websockets';
import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import {
  createGameBroadcastServiceMock,
  createGameSessionRepositoryMock,
  createGameSessionStateServiceMock,
  createGameTimerServiceMock,
} from '../../../test-utils/mock-factories';
import { GameBroadcastEventType } from '../ports';
import { PauseGameWsUseCase } from './pause-game-ws.use-case';

describe('PauseGameWsUseCase', () => {
  it('throws when hostId does not match', async () => {
    const state = { pause: vi.fn().mockReturnValue(5) };
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: { id: 1, hostId: 999 } as never,
    });
    const timerService = createGameTimerServiceMock();
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new PauseGameWsUseCase(
      gameSessionStateService as never,
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
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: { id: 1, hostId: 1 } as never,
      updateStatus: undefined,
    });
    const timerService = createGameTimerServiceMock();
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new PauseGameWsUseCase(
      gameSessionStateService as never,
      gameSessionRepository as never,
      timerService as never,
      broadcastService as never,
    );

    await useCase.execute('123456', 1);

    expect(timerService.clearAnswerRevealTimer).toHaveBeenCalledWith('123456');
    expect(gameSessionRepository.updateStatus).toHaveBeenCalledWith(1, GameSessionStatus.PAUSED);
    expect(broadcastService.publish).toHaveBeenCalledWith({
      type: GameBroadcastEventType.GAME_PAUSED,
      pin: '123456',
      timeLeft: 7,
    });
  });
});
