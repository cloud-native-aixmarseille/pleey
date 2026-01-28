import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../../../../domain/game/enums/game-session-status.enum';
import { GameBroadcastEventType } from '../../../../../domain/game/ports/services/game-broadcast.service';
import { createGameSessionStateFixture } from '../../../../../test-utils/fixtures/unit/game-session-state.fixture';
import { createPlayerScoreFixture } from '../../../../../test-utils/fixtures/unit/player-score.fixture';
import { createGameBroadcastServiceMock } from '../../../../../test-utils/mock-factories/game-broadcast-service.mock-factory';
import { createGameSessionRepositoryMock } from '../../../../../test-utils/mock-factories/game-session-repository.mock-factory';
import { createGameSessionStateServiceMock } from '../../../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { createGameTimerServiceMock } from '../../../../../test-utils/mock-factories/game-timer-service.mock-factory';
import type { HostStageControlContextService } from '../services/host-stage-control-context-service';
import { EndGameUseCase } from './end-game-use-case';

describe('EndGameUseCase', () => {
  it('throws UNAUTHORIZED_SESSION_CONTROL when hostId does not match', async () => {
    const state = createGameSessionStateFixture();
    const hostStageControlContextService = {
      load: vi.fn().mockRejectedValue(new Error(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL)),
    } as unknown as HostStageControlContextService;
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      remove: undefined,
    });
    const gameSessionRepository = createGameSessionRepositoryMock();
    const timerService = createGameTimerServiceMock();
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new EndGameUseCase(
      hostStageControlContextService as never,
      gameSessionStateService as never,
      gameSessionRepository as never,
      timerService as never,
      broadcastService as never,
    );

    await expect(useCase.execute({ pin: '123456', hostId: 2 })).rejects.toThrow(
      GameErrorCode.UNAUTHORIZED_SESSION_CONTROL,
    );
  });

  it('ends the game, clears timers, broadcasts and removes state', async () => {
    const scores = [createPlayerScoreFixture()];
    const state = createGameSessionStateFixture({ scores });
    const hostStageControlContextService = {
      load: vi.fn().mockResolvedValue({ state, session: { id: 1, gameId: 1 } }),
    } as unknown as HostStageControlContextService;
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      remove: undefined,
    });
    const gameSessionRepository = createGameSessionRepositoryMock({
      updateStatus: undefined,
    });
    const timerService = createGameTimerServiceMock();
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new EndGameUseCase(
      hostStageControlContextService as never,
      gameSessionStateService as never,
      gameSessionRepository as never,
      timerService as never,
      broadcastService as never,
    );

    await useCase.execute({ pin: '123456', hostId: 1 });

    expect(hostStageControlContextService.load).toHaveBeenCalledWith('123456', 1);
    expect(timerService.clearResultRevealTimer).toHaveBeenCalledWith('123456');
    expect(gameSessionRepository.updateStatus).toHaveBeenCalledWith(1, GameSessionStatus.ENDED);
    expect(gameSessionStateService.removePinsBySession).toHaveBeenCalledWith('123456');
    expect(broadcastService.publish).toHaveBeenCalledWith(
      expect.objectContaining({ type: GameBroadcastEventType.GAME_ENDED, pin: '123456' }),
    );
    expect(gameSessionStateService.remove).toHaveBeenCalledWith('123456');
  });
});
