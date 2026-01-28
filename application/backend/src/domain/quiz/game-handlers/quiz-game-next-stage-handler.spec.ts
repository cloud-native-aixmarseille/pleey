import { describe, expect, it, vi } from 'vitest';
import { createGameSessionStateFixture } from '../../../test-utils/fixtures/unit/game-session-state.fixture';
import { createEndGameUseCaseMock } from '../../../test-utils/mock-factories/end-game-use-case.mock-factory';
import { createGameBroadcastServiceMock } from '../../../test-utils/mock-factories/game-broadcast-service.mock-factory';
import { createGameSessionRepositoryMock } from '../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { createGameSessionStateServiceMock } from '../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { createResultRevealSchedulerMock } from '../../../test-utils/mock-factories/result-reveal-scheduler.mock-factory';
import { GameType } from '../../game/enums/game-type.enum';
import { GameBroadcastEventType } from '../../game/ports/services/game-broadcast.service';
import { QuizGameNextStageHandler } from './quiz-game-next-stage-handler';

describe('QuizGameNextStageHandler', () => {
  it('ends the game when there are no more stages', async () => {
    const state = createGameSessionStateFixture({
      hasMoreStages: false,
    });
    const gameSessionStateService = createGameSessionStateServiceMock({
      update: undefined,
    });
    const gameSessionRepository = createGameSessionRepositoryMock();
    const broadcastService = createGameBroadcastServiceMock();
    const endGameUseCase = createEndGameUseCaseMock({ endGame: undefined });
    const scheduler = createResultRevealSchedulerMock();

    const handler = new QuizGameNextStageHandler(
      gameSessionStateService as never,
      gameSessionRepository as never,
      broadcastService as never,
      endGameUseCase as never,
      scheduler as never,
    );

    await handler.nextStage({ pin: '123456', state: state as never, session: { id: 1 } as never });
    expect(endGameUseCase.endGame).toHaveBeenCalledWith('123456', state);
  });

  it('advances and broadcasts next stage when available', async () => {
    const advanceToNextStage = vi.fn();
    const state = createGameSessionStateFixture({
      hasMoreStages: true,
      advanceToNextStage,
    });
    const gameSessionStateService = createGameSessionStateServiceMock({
      update: undefined,
    });
    const gameSessionRepository = createGameSessionRepositoryMock({
      updateCurrentStage: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const endGameUseCase = createEndGameUseCaseMock();
    const scheduler = createResultRevealSchedulerMock();

    const handler = new QuizGameNextStageHandler(
      gameSessionStateService as never,
      gameSessionRepository as never,
      broadcastService as never,
      endGameUseCase as never,
      scheduler as never,
    );

    await handler.nextStage({ pin: '123456', state: state as never, session: { id: 1 } as never });
    expect(gameSessionRepository.updateCurrentStage).toHaveBeenCalledWith(1, 1);
    expect(scheduler.schedule).toHaveBeenCalledWith('123456', 10);
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GameBroadcastEventType.NEXT_STAGE,
        pin: '123456',
        activePlayerCount: state.getNonHostPlayers().length,
        gameType: GameType.QUIZ,
        stage: state.currentStage,
      }),
    );
  });
});
