import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SOCKET_URL } from '../../../app/config/api';
import { GameSessionLobbyRuntimeEventName } from '../../../application/game-session/live/player/ports/game-session-lobby-runtime.port';
import { GameSessionPlayingRuntimeEventName } from '../../../application/game-session/live/player/ports/game-session-playing-runtime.port';
import { JoinGameDispatchReceiptStatus } from '../../../application/game-session/live/shared/contracts/game-session-join-runtime.contract';
import { SocketIoGameSessionConnection } from './socket-io-game-session-connection';
import { SocketIoGameSessionHostControlRuntime } from './socket-io-game-session-host-control-runtime';
import { SocketIoGameSessionJoinRuntime } from './socket-io-game-session-join-runtime';
import { SocketIoGameSessionLobbyRuntime } from './socket-io-game-session-lobby-runtime';
import { SocketIoGameSessionPlayingRuntime } from './socket-io-game-session-playing-runtime';

const mocks = vi.hoisted(() => {
  const emit = vi.fn();
  const connect = vi.fn();
  const disconnect = vi.fn();
  const on = vi.fn();
  const off = vi.fn();
  const ioMock = vi.fn(() => ({
    connected: false,
    connect,
    disconnect,
    emit,
    on,
    off,
  }));

  return {
    connect,
    disconnect,
    emit,
    ioMock,
    off,
    on,
  };
});

vi.mock('socket.io-client', () => ({
  io: mocks.ioMock,
}));

describe('Socket.IO game-session runtimes', () => {
  beforeEach(() => {
    mocks.emit.mockReset();
    mocks.connect.mockReset();
    mocks.disconnect.mockReset();
    mocks.ioMock.mockClear();
    mocks.on.mockReset();
    mocks.off.mockReset();
  });

  it('shares a single lazy connection across runtimes', () => {
    const connection = new SocketIoGameSessionConnection();
    const joinRuntime = new SocketIoGameSessionJoinRuntime(connection);
    const playingRuntime = new SocketIoGameSessionPlayingRuntime(connection);

    joinRuntime.joinGame({
      pin: 'AB12CD',
      username: 'Neo',
      userId: 42,
    });
    playingRuntime.submitAction({
      pin: 'AB12CD',
      actionId: 3,
      timeLeft: 12,
      guestId: 'guest-9',
    });

    expect(mocks.ioMock).toHaveBeenCalledTimes(1);
    expect(mocks.ioMock).toHaveBeenCalledWith(SOCKET_URL, {
      autoConnect: false,
      auth: {},
      withCredentials: true,
    });
    expect(mocks.connect).toHaveBeenCalledTimes(2);
    expect(mocks.emit).toHaveBeenNthCalledWith(1, 'join-game', {
      pin: 'AB12CD',
      username: 'Neo',
      userId: 42,
      guestId: undefined,
    });
    expect(mocks.emit).toHaveBeenNthCalledWith(2, 'submit-action', {
      pin: 'AB12CD',
      actionId: 3,
      timeLeft: 12,
      userId: undefined,
      guestId: 'guest-9',
    });
  });

  it('requests join acknowledgements through the shared connection', async () => {
    const emitWithAck = vi.fn().mockResolvedValue({
      status: JoinGameDispatchReceiptStatus.ACCEPTED,
      avatarUri: '/api/avatars/guests/guest-9',
    });
    mocks.ioMock.mockImplementationOnce(() => ({
      connected: false,
      connect: mocks.connect,
      disconnect: mocks.disconnect,
      emit: mocks.emit,
      on: mocks.on,
      off: mocks.off,
      timeout: vi.fn(() => ({ emitWithAck })),
    }));

    const connection = new SocketIoGameSessionConnection();
    const joinRuntime = new SocketIoGameSessionJoinRuntime(connection);

    await expect(
      joinRuntime.joinGameWithReceipt({
        pin: 'AB12CD',
        username: 'Switch',
        guestId: 'guest-9',
      }),
    ).resolves.toEqual({
      status: JoinGameDispatchReceiptStatus.ACCEPTED,
      avatarUri: '/api/avatars/guests/guest-9',
    });

    expect(emitWithAck).toHaveBeenCalledWith('join-game', {
      pin: 'AB12CD',
      username: 'Switch',
      userId: undefined,
      guestId: 'guest-9',
    });
  });

  it('routes lobby events and commands through the shared connection', () => {
    const connection = new SocketIoGameSessionConnection();
    const lobbyRuntime = new SocketIoGameSessionLobbyRuntime(connection);
    const handler = vi.fn();

    lobbyRuntime.on(GameSessionLobbyRuntimeEventName.PLAYER_JOINED, handler);
    lobbyRuntime.observeSession('AB12CD');
    lobbyRuntime.startGame('AB12CD');
    lobbyRuntime.off(GameSessionLobbyRuntimeEventName.PLAYER_JOINED, handler);

    expect(mocks.on).toHaveBeenCalledWith(GameSessionLobbyRuntimeEventName.PLAYER_JOINED, handler);
    expect(mocks.emit).toHaveBeenNthCalledWith(1, 'observe-session', { pin: 'AB12CD' });
    expect(mocks.emit).toHaveBeenNthCalledWith(2, 'start-game', { pin: 'AB12CD' });
    expect(mocks.off).toHaveBeenCalledWith(GameSessionLobbyRuntimeEventName.PLAYER_JOINED, handler);
  });

  it('routes playing subscriptions through the shared connection', () => {
    const connection = new SocketIoGameSessionConnection();
    const playingRuntime = new SocketIoGameSessionPlayingRuntime(connection);
    const handler = vi.fn();

    playingRuntime.on(GameSessionPlayingRuntimeEventName.ACTION_RESULT, handler);
    playingRuntime.off(GameSessionPlayingRuntimeEventName.ACTION_RESULT, handler);

    expect(mocks.on).toHaveBeenCalledWith(
      GameSessionPlayingRuntimeEventName.ACTION_RESULT,
      handler,
    );
    expect(mocks.off).toHaveBeenCalledWith(
      GameSessionPlayingRuntimeEventName.ACTION_RESULT,
      handler,
    );
  });

  it('routes host control commands through the shared connection', () => {
    const connection = new SocketIoGameSessionConnection();
    const hostRuntime = new SocketIoGameSessionHostControlRuntime(connection);

    hostRuntime.pauseGame({ pin: 'AB12CD' });
    hostRuntime.resumeGame({ pin: 'AB12CD' });
    hostRuntime.restartStage({ pin: 'AB12CD' });
    hostRuntime.rewindStage({ pin: 'AB12CD' });
    hostRuntime.returnToLobby({ pin: 'AB12CD' });
    hostRuntime.nextStage({ pin: 'AB12CD' });
    hostRuntime.endGame({ pin: 'AB12CD' });

    expect(mocks.emit).toHaveBeenNthCalledWith(1, 'stop-game', { pin: 'AB12CD' });
    expect(mocks.emit).toHaveBeenNthCalledWith(2, 'resume-game', { pin: 'AB12CD' });
    expect(mocks.emit).toHaveBeenNthCalledWith(3, 'restart-stage', { pin: 'AB12CD' });
    expect(mocks.emit).toHaveBeenNthCalledWith(4, 'previous-stage', { pin: 'AB12CD' });
    expect(mocks.emit).toHaveBeenNthCalledWith(5, 'return-to-lobby', { pin: 'AB12CD' });
    expect(mocks.emit).toHaveBeenNthCalledWith(6, 'next-stage', { pin: 'AB12CD' });
    expect(mocks.emit).toHaveBeenNthCalledWith(7, 'end-game', { pin: 'AB12CD' });
  });

  it('updates the shared socket auth payload from the auth session runtime', () => {
    const connection = new SocketIoGameSessionConnection();

    connection.setAuthSessionTokens({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    connection.observeSession('AB12CD');

    expect(mocks.ioMock).toHaveBeenCalledWith(SOCKET_URL, {
      autoConnect: false,
      auth: { authorization: 'Bearer access-token' },
      withCredentials: true,
    });
  });
});
