import { describe, expect, it, vi } from 'vitest';

import {
  createGameBroadcastServiceMock,
  createGameTimerServiceMock,
  createSessionStateRepositoryMock,
} from '../../../test-utils/mock-factories';
import { RevealAnswersUseCase } from './reveal-answers.use-case';

describe('RevealAnswersUseCase', () => {
  it('no-ops when session state does not exist', async () => {
    const sessionStateRepository = createSessionStateRepositoryMock({ get: undefined });
    const timerService = createGameTimerServiceMock();
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new RevealAnswersUseCase(
      sessionStateRepository as never,
      timerService as never,
      broadcastService as never,
    );

    await useCase.execute('123456');
    expect(timerService.clearAnswerRevealTimer).not.toHaveBeenCalled();
  });

  it('clears timers and sends answer results to players', async () => {
    const state = {
      answeredCount: 1,
      currentQuestion: { correctAnswer: 'A' },
      getAllAnswers: () => [
        { playerId: 'user-1', answer: 'A', isCorrect: true, points: 1000, timeLeft: 5 },
      ],
      getPlayerEntries: () => new Map([['socket-1', { playerId: 'user-1' }]]).entries(),
      getAnswer: vi.fn().mockReturnValue({ isCorrect: true, points: 1000 }),
      getScoresExcludingHost: () => [
        { playerId: 'user-1', username: 'alice', totalPoints: 1000, isGuest: false },
      ],
    };

    const sessionStateRepository = createSessionStateRepositoryMock({ get: state as never });
    const timerService = createGameTimerServiceMock();
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new RevealAnswersUseCase(
      sessionStateRepository as never,
      timerService as never,
      broadcastService as never,
    );

    await useCase.execute('123456');

    expect(timerService.clearAnswerRevealTimer).toHaveBeenCalledWith('123456');
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'answer-result', connectionId: 'socket-1' }),
    );
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'leaderboard-updated', pin: '123456' }),
    );
  });
});
