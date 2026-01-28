import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../../../../domain/game/enums/game-session-status.enum';
import { GameType } from '../../../../../domain/game/enums/game-type.enum';
import { GameBroadcastEventType } from '../../../../../domain/game/ports/services/game-broadcast.service';
import { createGameSessionStateFixture } from '../../../../../test-utils/fixtures/unit/game-session-state.fixture';
import { createGameBroadcastServiceMock } from '../../../../../test-utils/mock-factories/game-broadcast-service.mock-factory';
import { createGameRepositoryMock } from '../../../../../test-utils/mock-factories/game-repository.mock-factory';
import { createGameSessionRepositoryMock } from '../../../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { createGameSessionStateServiceMock } from '../../../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { createResultRevealSchedulerMock } from '../../../../../test-utils/mock-factories/result-reveal-scheduler.mock-factory';
import { HostStageControlContextService } from '../services/host-stage-control-context-service';
import { RestartGameStageUseCase } from './restart-game-stage-use-case';

describe('RestartGameStageUseCase', () => {
  it('throws when the requester is not the host', async () => {
    const state = createGameSessionStateFixture();
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
    });
    const gameRepository = createGameRepositoryMock();
    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: { id: 1, hostId: 12, status: GameSessionStatus.ACTIVE } as never,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const resultRevealScheduler = createResultRevealSchedulerMock();
    const hostStageControlContextService = new HostStageControlContextService(
      gameSessionStateService as never,
      gameSessionRepository as never,
      gameRepository as never,
    );

    const useCase = new RestartGameStageUseCase(
      hostStageControlContextService as never,
      gameSessionRepository as never,
      broadcastService as never,
      resultRevealScheduler as never,
    );

    await expect(useCase.execute('123456', 99)).rejects.toThrow(
      GameErrorCode.UNAUTHORIZED_SESSION_CONTROL,
    );
  });

  it('throws when there is no active stage to restart', async () => {
    const state = createGameSessionStateFixture({ hasStages: false } as never);
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
    });
    const gameRepository = createGameRepositoryMock({
      findById: { id: 1, type: GameType.QUIZ } as never,
    });
    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: { id: 1, hostId: 7, status: GameSessionStatus.ACTIVE } as never,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const resultRevealScheduler = createResultRevealSchedulerMock();
    const hostStageControlContextService = new HostStageControlContextService(
      gameSessionStateService as never,
      gameSessionRepository as never,
      gameRepository as never,
    );

    const useCase = new RestartGameStageUseCase(
      hostStageControlContextService as never,
      gameSessionRepository as never,
      broadcastService as never,
      resultRevealScheduler as never,
    );

    await expect(useCase.execute('123456', 7)).rejects.toThrow(
      GameErrorCode.NO_CURRENT_STAGE_TO_RESUME,
    );
  });

  it('restarts the current stage and rebroadcasts it as a fresh live stage', async () => {
    const restartCurrentStage = vi.fn();
    const state = createGameSessionStateFixture({
      currentStage: {
        id: 2,
        position: 1,
        text: 'Second?',
        actions: [{ id: 2, text: 'Two', position: 0, isCorrect: true }],
        timeLimit: 15,
        points: 1000,
        type: 'multiple',
      },
      restartCurrentStage: restartCurrentStage as never,
    } as never);
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });
    const gameRepository = createGameRepositoryMock({
      findById: { id: 1, type: GameType.QUIZ } as never,
    });
    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: { id: 1, hostId: 7, status: GameSessionStatus.ACTIVE } as never,
      updateCurrentStage: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const resultRevealScheduler = createResultRevealSchedulerMock();
    const hostStageControlContextService = new HostStageControlContextService(
      gameSessionStateService as never,
      gameSessionRepository as never,
      gameRepository as never,
    );

    const useCase = new RestartGameStageUseCase(
      hostStageControlContextService as never,
      gameSessionRepository as never,
      broadcastService as never,
      resultRevealScheduler as never,
    );

    await useCase.execute('123456', 7);

    expect(resultRevealScheduler.clear).toHaveBeenCalledWith('123456');
    expect(restartCurrentStage).toHaveBeenCalledTimes(1);
    expect(gameSessionRepository.updateCurrentStage).toHaveBeenCalledWith(1, 2);
    expect(resultRevealScheduler.schedule).toHaveBeenCalledWith('123456', 15);
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: GameBroadcastEventType.NEXT_STAGE,
        pin: '123456',
        gameTitle: 'Arcade Trivia',
        gameType: GameType.QUIZ,
        activePlayerCount: state.getNonHostPlayers().length,
        stage: state.currentStage,
      }),
    );
  });
});
