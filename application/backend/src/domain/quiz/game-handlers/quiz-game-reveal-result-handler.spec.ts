import { describe, expect, it, vi } from 'vitest';
import { createGameStageFixture } from '../../../test-utils/fixtures/unit/game-stage.fixture';
import { createGameBroadcastServiceMock } from '../../../test-utils/mock-factories/game-broadcast-service.mock-factory';
import { createGameTimerServiceMock } from '../../../test-utils/mock-factories/game-timer-service.mock-factory';
import { GameBroadcastEventType } from '../../game/ports/services/game-broadcast.service';
import { ActionDistributionService } from '../../game/services/action-distribution-service';
import { QuizGameRevealResultHandler } from './quiz-game-reveal-result-handler';

describe('QuizGameRevealResultHandler', () => {
  it('clears timers and no-ops when current stage is missing', async () => {
    const state = {
      actionCount: 0,
      currentStage: undefined,
      getAllActions: () => [],
      getPlayerEntries: () => new Map().entries(),
      getAction: vi.fn(),
      getScoresExcludingHost: () => [],
      getCorrectActionIds: () => [],
    };

    const timerService = createGameTimerServiceMock();
    const broadcastService = createGameBroadcastServiceMock();
    const actionDistributionService = new ActionDistributionService();

    const handler = new QuizGameRevealResultHandler(
      timerService as never,
      broadcastService as never,
      actionDistributionService,
    );

    await handler.reveal({ pin: '123456', state: state as never, session: { id: 1 } as never });

    expect(timerService.clearResultRevealTimer).toHaveBeenCalledWith('123456');
    expect(broadcastService.publish).not.toHaveBeenCalled();
  });

  it('clears timers and sends action results to players', async () => {
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

    const timerService = createGameTimerServiceMock();
    const broadcastService = createGameBroadcastServiceMock();
    const actionDistributionService = new ActionDistributionService();

    const handler = new QuizGameRevealResultHandler(
      timerService as never,
      broadcastService as never,
      actionDistributionService,
    );

    await handler.reveal({ pin: '123456', state: state as never, session: { id: 1 } as never });

    expect(timerService.clearResultRevealTimer).toHaveBeenCalledWith('123456');
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GameBroadcastEventType.ACTION_RESULT,
        connectionId: 'socket-1',
      }),
    );
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GameBroadcastEventType.RESULT_REVEALED,
        pin: '123456',
        result: expect.objectContaining({
          correctActionIds: [1],
          points: 0,
          isCorrect: false,
        }),
      }),
    );
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GameBroadcastEventType.LEADERBOARD_UPDATED,
        pin: '123456',
      }),
    );
  });
});
