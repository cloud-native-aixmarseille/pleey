import { describe, expect, it, vi } from 'vitest';
import { createGameSessionFixture } from '../../../test-utils/fixtures/unit/game-session.fixture';
import { createGameBroadcastServiceMock } from '../../../test-utils/mock-factories/game-broadcast-service.mock-factory';
import { createGameSessionRepositoryMock } from '../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { createGameSessionStateServiceMock } from '../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { createGameTimerServiceMock } from '../../../test-utils/mock-factories/game-timer-service.mock-factory';
import { GameSessionStatus } from '../../game/enums/game-session-status.enum';
import { GameBroadcastEventType } from '../../game/ports/services/game-broadcast.service';
import { QuizGamePauseHandler } from './quiz-game-pause-handler';

describe('QuizGamePauseHandler', () => {
  it('clears timer, updates status and broadcasts remaining time', async () => {
    const state = { pause: vi.fn().mockReturnValue(7) };
    const gameSessionStateService = createGameSessionStateServiceMock({
      update: undefined,
    });

    const gameSessionRepository = createGameSessionRepositoryMock({
      updateStatus: undefined,
    });
    const timerService = createGameTimerServiceMock();
    const broadcastService = createGameBroadcastServiceMock();
    const handler = new QuizGamePauseHandler(
      gameSessionStateService as never,
      gameSessionRepository as never,
      timerService as never,
      broadcastService as never,
    );

    await handler.pause({
      pin: '123456',
      state: state as never,
      session: createGameSessionFixture() as never,
      hostId: 1,
    });

    expect(timerService.clearResultRevealTimer).toHaveBeenCalledWith('123456');
    expect(gameSessionRepository.updateStatus).toHaveBeenCalledWith(1, GameSessionStatus.PAUSED);
    expect(broadcastService.publish).toHaveBeenCalledWith({
      type: GameBroadcastEventType.GAME_PAUSED,
      pin: '123456',
      timeLeft: 7,
    });
  });
});
