import { describe, expect, it, vi } from 'vitest';
import { createGameSessionStateFixture } from '../../../test-utils/fixtures/unit/game-session-state.fixture';
import { createGameBroadcastServiceMock } from '../../../test-utils/mock-factories/game-broadcast-service.mock-factory';
import { createGameSessionRepositoryMock } from '../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { createGameSessionStateServiceMock } from '../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { createResultRevealSchedulerMock } from '../../../test-utils/mock-factories/result-reveal-scheduler.mock-factory';
import { GameErrorCode } from '../../game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../game/enums/game-session-status.enum';
import { GameType } from '../../game/enums/game-type.enum';
import { GameBroadcastEventType } from '../../game/ports/services/game-broadcast.service';
import { QuizGameStartHandler } from './quiz-game-start-handler';

describe('QuizGameStartHandler', () => {
  it('throws when no questions are available', async () => {
    const state = createGameSessionStateFixture({ hasStages: false, currentStage: undefined });
    const gameSessionStateService = createGameSessionStateServiceMock();
    const gameSessionRepository = createGameSessionRepositoryMock();
    const broadcastService = createGameBroadcastServiceMock();
    const scheduler = createResultRevealSchedulerMock();

    const handler = new QuizGameStartHandler(
      gameSessionStateService as never,
      gameSessionRepository as never,
      broadcastService as never,
      scheduler as never,
    );

    await expect(
      handler.start({ pin: '123456', state: state as never, session: { id: 1 } as never }),
    ).rejects.toThrow(GameErrorCode.NO_STAGES_AVAILABLE);

    expect(gameSessionStateService.update).not.toHaveBeenCalled();
  });

  it('starts the game, schedules reveal, updates status and broadcasts', async () => {
    const state = createGameSessionStateFixture({ startFirstStage: vi.fn() });
    const gameSessionStateService = createGameSessionStateServiceMock({ update: undefined });
    const gameSessionRepository = createGameSessionRepositoryMock({
      updateStatus: undefined,
      updateCurrentStage: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const scheduler = createResultRevealSchedulerMock();

    const handler = new QuizGameStartHandler(
      gameSessionStateService as never,
      gameSessionRepository as never,
      broadcastService as never,
      scheduler as never,
    );

    await handler.start({ pin: '123456', state: state as never, session: { id: 1 } as never });

    expect(state.startFirstStage).toHaveBeenCalled();
    expect(gameSessionStateService.update).toHaveBeenCalledWith('123456', state);
    expect(gameSessionRepository.updateStatus).toHaveBeenCalledWith(1, GameSessionStatus.ACTIVE);
    expect(gameSessionRepository.updateCurrentStage).toHaveBeenCalledWith(1, 1);
    expect(scheduler.schedule).toHaveBeenCalledWith('123456', 10);
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GameBroadcastEventType.GAME_STARTED,
        pin: '123456',
        activePlayerCount: state.getNonHostPlayers().length,
        gameType: GameType.QUIZ,
        totalStages: 1,
      }),
    );
  });
});
