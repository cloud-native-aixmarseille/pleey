import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../../../../domain/game/enums/game-session-status.enum';
import { GameBroadcastEventType } from '../../../../../domain/game/ports/services/game-broadcast.service';
import { createGameSessionStateFixture } from '../../../../../test-utils/fixtures/unit/game-session-state.fixture';
import { createGameBroadcastServiceMock } from '../../../../../test-utils/mock-factories/game-broadcast-service.mock-factory';
import { createGameSessionRepositoryMock } from '../../../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { createGameSessionStateServiceMock } from '../../../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { createResultRevealSchedulerMock } from '../../../../../test-utils/mock-factories/result-reveal-scheduler.mock-factory';
import { HostStageControlContextService } from '../services/host-stage-control-context-service';
import { ReturnGameToLobbyUseCase } from './return-game-to-lobby-use-case';

describe('ReturnGameToLobbyUseCase', () => {
  it('throws when the requester is not the host', async () => {
    const state = createGameSessionStateFixture();
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
    });
    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: { id: 1, hostId: 12, status: GameSessionStatus.ACTIVE } as never,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const resultRevealScheduler = createResultRevealSchedulerMock();
    const hostStageControlContextService = new HostStageControlContextService(
      gameSessionStateService as never,
      gameSessionRepository as never,
      { findById: undefined } as never,
    );

    const useCase = new ReturnGameToLobbyUseCase(
      hostStageControlContextService as never,
      gameSessionRepository as never,
      broadcastService as never,
      resultRevealScheduler as never,
    );

    await expect(useCase.execute('123456', 99)).rejects.toThrow(
      GameErrorCode.UNAUTHORIZED_SESSION_CONTROL,
    );
  });

  it('cancels the current stage and returns the session to the lobby', async () => {
    const players = [{ socketId: 'socket-1', username: 'Neo', avatarSeed: 'seed', userId: 7 }];
    const returnToLobby = vi.fn(() => {
      state.currentStage = undefined;
    });
    const state = createGameSessionStateFixture({
      returnToLobby: returnToLobby as never,
      getAllPlayers: () => players as never,
    } as never);
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });
    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: { id: 1, hostId: 7, status: GameSessionStatus.ACTIVE } as never,
      updateCurrentStage: undefined,
      updateStatus: undefined,
    });
    const broadcastService = createGameBroadcastServiceMock();
    const resultRevealScheduler = createResultRevealSchedulerMock();
    const hostStageControlContextService = new HostStageControlContextService(
      gameSessionStateService as never,
      gameSessionRepository as never,
      { findById: undefined } as never,
    );

    const useCase = new ReturnGameToLobbyUseCase(
      hostStageControlContextService as never,
      gameSessionRepository as never,
      broadcastService as never,
      resultRevealScheduler as never,
    );

    await useCase.execute('123456', 7);

    expect(resultRevealScheduler.clear).toHaveBeenCalledWith('123456');
    expect(returnToLobby).toHaveBeenCalledTimes(1);
    expect(gameSessionRepository.updateCurrentStage).toHaveBeenCalledWith(1, null);
    expect(gameSessionRepository.updateStatus).toHaveBeenCalledWith(1, GameSessionStatus.WAITING);
    expect(broadcastService.publish).toHaveBeenCalledWith({
      type: GameBroadcastEventType.RETURNED_TO_LOBBY,
      pin: '123456',
      sessionId: 1,
      gameTitle: 'Arcade Trivia',
      gameType: 'quiz',
      players,
    });
  });
});
