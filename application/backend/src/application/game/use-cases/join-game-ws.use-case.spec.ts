import { WsException } from '@nestjs/websockets';
import { describe, expect, it } from 'vitest';

import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import { createJoinGameSessionStateFixture } from '../../../test-utils/fixtures/unit';
import {
  createGameBroadcastServiceMock,
  createGameSessionRepositoryMock,
  createGameSessionStateServiceMock,
} from '../../../test-utils/mock-factories';
import type { JoinGameDto } from '../dto/join-game.dto';
import { GameBroadcastEventType } from '../ports';
import { JoinGameWsUseCase } from './join-game-ws.use-case';

describe('JoinGameWsUseCase', () => {
  it('throws when both userId and guestId are provided', async () => {
    const state = createJoinGameSessionStateFixture();
    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });
    const gameSessionRepository = createGameSessionRepositoryMock();
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new JoinGameWsUseCase(
      gameSessionStateService as never,
      gameSessionRepository as never,
      broadcastService as never,
    );

    const dto: JoinGameDto = {
      pin: '123456',
      username: 'alice',
      userId: 1,
      guestId: 'g1',
    };

    await expect(useCase.execute('socket-1', dto)).rejects.toBeInstanceOf(WsException);
  });

  it('broadcasts player list', async () => {
    const state = createJoinGameSessionStateFixture();

    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });
    const gameSessionRepository = createGameSessionRepositoryMock();
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new JoinGameWsUseCase(
      gameSessionStateService as never,
      gameSessionRepository as never,
      broadcastService as never,
    );

    const dto: JoinGameDto = { pin: '123456', username: 'alice', guestId: 'g1' };
    await useCase.execute('socket-1', dto);

    expect(broadcastService.publish).toHaveBeenCalledWith({
      type: GameBroadcastEventType.PLAYER_JOINED,
      pin: '123456',
      sessionId: 1,
      players: [],
    });
    expect(state.addPlayer).toHaveBeenCalledTimes(1);
  });

  it('rebroadcasts paused state when joining a paused session', async () => {
    const state = createJoinGameSessionStateFixture({ pausedTimeLeft: 7 });

    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });
    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: { status: GameSessionStatus.PAUSED } as never,
    });
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new JoinGameWsUseCase(
      gameSessionStateService as never,
      gameSessionRepository as never,
      broadcastService as never,
    );

    const dto: JoinGameDto = { pin: '123456', username: 'alice', guestId: 'g1' };
    await useCase.execute('socket-1', dto);

    expect(broadcastService.publish).toHaveBeenNthCalledWith(1, {
      type: GameBroadcastEventType.PLAYER_JOINED,
      pin: '123456',
      sessionId: 1,
      players: [],
    });

    expect(broadcastService.publish).toHaveBeenNthCalledWith(2, {
      type: GameBroadcastEventType.GAME_STATE,
      connectionId: 'socket-1',
      question: state.currentQuestion,
      totalQuestions: 3,
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
      questionStartTime: Date.now() - 4000,
    });

    const gameSessionStateService = createGameSessionStateServiceMock({
      getOrCreate: state as never,
      update: undefined,
    });
    const gameSessionRepository = createGameSessionRepositoryMock({
      findByPin: { status: GameSessionStatus.PAUSED } as never,
    });
    const broadcastService = createGameBroadcastServiceMock();

    const useCase = new JoinGameWsUseCase(
      gameSessionStateService as never,
      gameSessionRepository as never,
      broadcastService as never,
    );

    const dto: JoinGameDto = { pin: '123456', username: 'host', userId: 42 };
    await useCase.execute('socket-host', dto);

    expect(broadcastService.publish).toHaveBeenNthCalledWith(1, {
      type: GameBroadcastEventType.PLAYER_JOINED,
      pin: '123456',
      sessionId: 1,
      players: [],
    });

    expect(broadcastService.publish).toHaveBeenNthCalledWith(2, {
      type: GameBroadcastEventType.GAME_STATE,
      connectionId: 'socket-host',
      question: state.currentQuestion,
      totalQuestions: 3,
      timeLeft: 11,
    });

    expect(broadcastService.publish).toHaveBeenNthCalledWith(3, {
      type: GameBroadcastEventType.GAME_PAUSED,
      pin: '123456',
      timeLeft: 11,
    });
  });
});
