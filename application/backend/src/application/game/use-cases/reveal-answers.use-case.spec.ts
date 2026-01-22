import { describe, expect, it, vi } from 'vitest';
import { createQuestionFixture } from '../../../test-utils/fixtures/unit';
import {
  createGameBroadcastServiceMock,
  createGameSessionStateServiceMock,
  createGameTimerServiceMock,
} from '../../../test-utils/mock-factories';
import { GameBroadcastEventType } from '../ports';
import { RevealAnswersUseCase } from './reveal-answers.use-case';

describe('RevealAnswersUseCase', () => {
  it('no-ops when session state does not exist', async () => {
    const gameSessionStateService = createGameSessionStateServiceMock({ get: undefined });
    const timerService = createGameTimerServiceMock();
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new RevealAnswersUseCase(
      gameSessionStateService as never,
      timerService as never,
      broadcastService as never,
    );

    await useCase.execute('123456');
    expect(timerService.clearAnswerRevealTimer).not.toHaveBeenCalled();
  });

  it('clears timers and sends answer results to players', async () => {
    const state = {
      answeredCount: 1,
      currentQuestion: createQuestionFixture(),
      getAllAnswers: () => [
        { playerId: 'user-1', answerId: 1, isCorrect: true, points: 1000, timeLeft: 5 },
      ],
      getPlayerEntries: () => new Map([['socket-1', { playerId: 'user-1' }]]).entries(),
      getAnswer: vi.fn().mockReturnValue({ isCorrect: true, points: 1000 }),
      getScoresExcludingHost: () => [
        { playerId: 'user-1', userId: 1, username: 'alice', totalPoints: 1000 },
      ],
    };

    const gameSessionStateService = createGameSessionStateServiceMock({ get: state as never });
    const timerService = createGameTimerServiceMock();
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new RevealAnswersUseCase(
      gameSessionStateService as never,
      timerService as never,
      broadcastService as never,
    );

    await useCase.execute('123456');

    expect(timerService.clearAnswerRevealTimer).toHaveBeenCalledWith('123456');
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GameBroadcastEventType.ANSWER_RESULT,
        connectionId: 'socket-1',
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
