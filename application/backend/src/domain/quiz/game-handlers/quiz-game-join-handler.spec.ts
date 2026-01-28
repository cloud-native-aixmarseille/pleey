import { describe, expect, it } from 'vitest';
import { createGameSessionFixture } from '../../../test-utils/fixtures/unit/game-session.fixture';
import { createJoinGameDtoFixture } from '../../../test-utils/fixtures/unit/join-game-dto.fixture';
import { createJoinGameSessionStateFixture } from '../../../test-utils/fixtures/unit/join-game-session-state.fixture';
import { createGameBroadcastServiceMock } from '../../../test-utils/mock-factories/game-broadcast-service.mock-factory';
import { createGameSessionStateServiceMock } from '../../../test-utils/mock-factories/game-session-state-service.mock-factory';
import { createGuestRepositoryMock } from '../../../test-utils/mock-factories/guest-repository.mock-factory';
import { GameErrorCode } from '../../game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../game/enums/game-session-status.enum';
import { GameType } from '../../game/enums/game-type.enum';
import { GameBroadcastEventType } from '../../game/ports/services/game-broadcast.service';
import { ActionDistributionService } from '../../game/services/action-distribution-service';
import { QuizGameJoinHandler } from './quiz-game-join-handler';

describe('QuizGameJoinHandler', () => {
  it('throws when both userId and guestId are provided', async () => {
    const state = createJoinGameSessionStateFixture();
    const gameSessionStateService = createGameSessionStateServiceMock({
      update: undefined,
    });
    const guestRepository = createGuestRepositoryMock();
    const broadcastService = createGameBroadcastServiceMock();
    const actionDistributionService = new ActionDistributionService();

    const handler = new QuizGameJoinHandler(
      gameSessionStateService as never,
      guestRepository as never,
      broadcastService as never,
      actionDistributionService,
    );

    const dto = createJoinGameDtoFixture({ userId: 1 });

    await expect(
      handler.join({
        connectionId: 'socket-1',
        dto,
        pin: dto.pin,
        state: state as never,
        session: createGameSessionFixture() as never,
      }),
    ).rejects.toThrow(GameErrorCode.VALIDATION_FAILED);
  });

  it('broadcasts player list', async () => {
    const state = createJoinGameSessionStateFixture();
    const gameSessionStateService = createGameSessionStateServiceMock({
      update: undefined,
    });
    const guestRepository = createGuestRepositoryMock();
    const broadcastService = createGameBroadcastServiceMock();
    const actionDistributionService = new ActionDistributionService();

    const handler = new QuizGameJoinHandler(
      gameSessionStateService as never,
      guestRepository as never,
      broadcastService as never,
      actionDistributionService,
    );

    const dto = createJoinGameDtoFixture();
    await handler.join({
      connectionId: 'socket-1',
      dto,
      pin: dto.pin,
      state: state as never,
      session: createGameSessionFixture() as never,
    });

    expect(broadcastService.publish).toHaveBeenCalledWith({
      type: GameBroadcastEventType.PLAYER_JOINED,
      pin: '123456',
      sessionId: 1,
      gameTitle: 'Arcade Trivia',
      gameType: GameType.QUIZ,
      players: [],
    });
    expect(state.addPlayer).toHaveBeenCalledTimes(1);
  });

  it('rebroadcasts paused state when joining a paused session', async () => {
    const state = createJoinGameSessionStateFixture({ pausedTimeLeft: 7 });
    const gameSessionStateService = createGameSessionStateServiceMock({
      update: undefined,
    });
    const guestRepository = createGuestRepositoryMock();
    const broadcastService = createGameBroadcastServiceMock();
    const actionDistributionService = new ActionDistributionService();

    const handler = new QuizGameJoinHandler(
      gameSessionStateService as never,
      guestRepository as never,
      broadcastService as never,
      actionDistributionService,
    );

    const dto = createJoinGameDtoFixture();
    await handler.join({
      connectionId: 'socket-1',
      dto,
      pin: dto.pin,
      state: state as never,
      session: createGameSessionFixture({ status: GameSessionStatus.PAUSED }) as never,
    });

    expect(broadcastService.publish).toHaveBeenNthCalledWith(1, {
      type: GameBroadcastEventType.PLAYER_JOINED,
      pin: '123456',
      sessionId: 1,
      gameTitle: 'Arcade Trivia',
      gameType: GameType.QUIZ,
      players: [],
    });

    expect(broadcastService.publish).toHaveBeenNthCalledWith(2, {
      type: GameBroadcastEventType.GAME_STATE,
      connectionId: 'socket-1',
      gameTitle: 'Arcade Trivia',
      gameType: GameType.QUIZ,
      activePlayerCount: 0,
      stage: state.currentStage,
      totalStages: 3,
      timeLeft: 7,
    });

    expect(broadcastService.publish).toHaveBeenNthCalledWith(3, {
      type: GameBroadcastEventType.GAME_PAUSED,
      pin: '123456',
      timeLeft: 7,
    });
  });

  it('sends game-state to host when joining a paused session, then broadcasts paused state', async () => {
    const state = createJoinGameSessionStateFixture({
      hostId: 42,
      pausedTimeLeft: 11,
      stageStartTime: Date.now() - 4000,
    });
    const gameSessionStateService = createGameSessionStateServiceMock({
      update: undefined,
    });
    const guestRepository = createGuestRepositoryMock();
    const broadcastService = createGameBroadcastServiceMock();
    const actionDistributionService = new ActionDistributionService();

    const handler = new QuizGameJoinHandler(
      gameSessionStateService as never,
      guestRepository as never,
      broadcastService as never,
      actionDistributionService,
    );

    const dto = createJoinGameDtoFixture({ userId: 42, guestId: undefined });
    await handler.join({
      connectionId: 'socket-host',
      dto,
      pin: dto.pin,
      state: state as never,
      session: createGameSessionFixture({ status: GameSessionStatus.PAUSED }) as never,
    });

    expect(broadcastService.publish).toHaveBeenNthCalledWith(1, {
      type: GameBroadcastEventType.PLAYER_JOINED,
      pin: '123456',
      sessionId: 1,
      gameTitle: 'Arcade Trivia',
      gameType: GameType.QUIZ,
      players: [],
    });

    expect(broadcastService.publish).toHaveBeenNthCalledWith(2, {
      type: GameBroadcastEventType.GAME_STATE,
      connectionId: 'socket-host',
      gameTitle: 'Arcade Trivia',
      gameType: GameType.QUIZ,
      activePlayerCount: 0,
      stage: state.currentStage,
      totalStages: 3,
      timeLeft: 11,
    });

    expect(broadcastService.publish).toHaveBeenNthCalledWith(3, {
      type: GameBroadcastEventType.GAME_PAUSED,
      pin: '123456',
      timeLeft: 11,
    });
  });
});
