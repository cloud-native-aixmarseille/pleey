import { describe, expect, it, vi } from 'vitest';
import { createGameSessionFixture } from '../../../test-utils/fixtures/unit/game-session.fixture';
import { createGameSessionStateFixture } from '../../../test-utils/fixtures/unit/game-session-state.fixture';
import { createGameBroadcastServiceMock } from '../../../test-utils/mock-factories/game-broadcast-service.mock-factory';
import { createGameSessionRepositoryMock } from '../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { createGameSessionStateServiceMock } from '../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { createResultRevealSchedulerMock } from '../../../test-utils/mock-factories/result-reveal-scheduler.mock-factory';
import { GameErrorCode } from '../../game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../game/enums/game-session-status.enum';
import { GameType } from '../../game/enums/game-type.enum';
import { GameBroadcastEventType } from '../../game/ports/services/game-broadcast.service';
import { QuizGameResumeHandler } from './quiz-game-resume-handler';

describe('QuizGameResumeHandler', () => {
  it('throws when there is no current question', async () => {
    const state = createGameSessionStateFixture({ resume: vi.fn().mockReturnValue(5) });
    state.currentStage = undefined;
    const gameSessionStateService = createGameSessionStateServiceMock({ update: undefined });
    const gameSessionRepository = createGameSessionRepositoryMock({
      updateStatus: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const scheduler = createResultRevealSchedulerMock();

    const handler = new QuizGameResumeHandler(
      gameSessionStateService as never,
      gameSessionRepository as never,
      broadcastService as never,
      scheduler as never,
    );

    await expect(
      handler.resume({
        pin: '123456',
        state: state as never,
        session: createGameSessionFixture() as never,
        hostId: 1,
      }),
    ).rejects.toThrow(GameErrorCode.NO_STAGES_AVAILABLE);
  });

  it('updates status, schedules, and broadcasts state', async () => {
    const state = createGameSessionStateFixture({ resume: vi.fn().mockReturnValue(5) });
    const gameSessionStateService = createGameSessionStateServiceMock({ update: undefined });

    const gameSessionRepository = createGameSessionRepositoryMock({
      updateStatus: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const scheduler = createResultRevealSchedulerMock();

    const handler = new QuizGameResumeHandler(
      gameSessionStateService as never,
      gameSessionRepository as never,
      broadcastService as never,
      scheduler as never,
    );

    await handler.resume({
      pin: '123456',
      state: state as never,
      session: createGameSessionFixture() as never,
      hostId: 1,
    });

    expect(gameSessionRepository.updateStatus).toHaveBeenCalledWith(1, GameSessionStatus.ACTIVE);
    expect(scheduler.schedule).toHaveBeenCalledWith('123456', 5);
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GameBroadcastEventType.GAME_RESUMED,
        pin: '123456',
        activePlayerCount: state.getNonHostPlayers().length,
        gameType: GameType.QUIZ,
        totalStages: 1,
        timeLeft: 5,
      }),
    );
  });
});
