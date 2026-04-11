import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GameIdentifier } from '../../../../application/game/shared/services/identifiers/game-identifier';
import { GameTypeParser } from '../../../../application/game/types/shared/services/game-type-parser';
import { GuestIdentifier } from '../../../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../../../application/identity/shared/services/identifiers/user-identifier';
import { PartyJoinReceiptStatus } from '../../../../domains/game/party/player/ports/party-player.port';
import { PartyPlayerIdentityKind } from '../../../../domains/game/party/shared/entities/party-player-identity';
import { GameType } from '../../../../domains/game/types/shared/game-type';
import { SocketIoPartyHostControlAdapter } from '../host/socket-io-party-host-control.adapter';
import { SocketIoPartyPlayerAdapter } from '../player/socket-io-party-player.adapter';
import { SocketIoPartyObservationAdapter } from './socket-io-party-observation.adapter';
import { SocketIoPartyPayloadMapper } from './socket-io-party-payload-mapper';
import { SocketIoPartyRealtimeTransport } from './socket-io-party-realtime-transport';

const guestIdentifier = new GuestIdentifier();
const userIdentifier = new UserIdentifier();
const partyIdentifier = new PartyIdentifier();
const partyPinIdentifier = new PartyPinIdentifier();
const partyActionIdentifier = new PartyActionIdentifier();
const gameIdentifier = new GameIdentifier();
const gameTypeParser = new GameTypeParser();

function createPayloadMapper() {
  return new SocketIoPartyPayloadMapper(
    partyActionIdentifier,
    guestIdentifier,
    userIdentifier,
    partyIdentifier,
    partyPinIdentifier,
    gameIdentifier,
    gameTypeParser,
  );
}

function createObservationAdapter() {
  const transport = new SocketIoPartyRealtimeTransport(partyIdentifier);

  return {
    adapter: new SocketIoPartyObservationAdapter(createPayloadMapper(), transport),
    transport,
  };
}

function createPlayerAdapter() {
  return new SocketIoPartyPlayerAdapter(
    createPayloadMapper(),
    new SocketIoPartyRealtimeTransport(partyIdentifier),
  );
}

function createHostControlAdapter() {
  const transport = new SocketIoPartyRealtimeTransport(partyIdentifier);

  return {
    adapter: new SocketIoPartyHostControlAdapter(transport),
    transport,
  };
}

function createAcceptedGuestJoinReceipt() {
  return {
    gameId: 17,
    player: {
      avatarUri: '/avatars/guest-9.png',
      identity: { kind: PartyPlayerIdentityKind.Guest, guestId: 'guest-9' },
      username: 'Neo',
    },
    partyId: 44,
    pin: 'AB12CD',
    status: PartyJoinReceiptStatus.ACCEPTED,
  };
}

const { connectMock, disconnectMock, emitMock, ioMock, offMock, onMock, socket } = vi.hoisted(
  () => {
    const handlers = new Map<string, Array<(payload?: unknown) => void>>();
    const connectMock = vi.fn();
    const disconnectMock = vi.fn();
    const emitMock = vi.fn();
    const onMock = vi.fn((event: string, handler: (payload?: unknown) => void) => {
      const currentHandlers = handlers.get(event) ?? [];
      currentHandlers.push(handler);
      handlers.set(event, currentHandlers);
      return socket;
    });
    const offMock = vi.fn();
    const socket = {
      auth: {},
      connected: false,
      connect: connectMock,
      disconnect: disconnectMock,
      emit: emitMock,
      off: offMock,
      on: onMock,
    };

    return {
      connectMock,
      disconnectMock,
      emitMock,
      ioMock: vi.fn(() => socket),
      offMock,
      onMock,
      socket,
    };
  },
);

vi.mock('socket.io-client', () => ({
  io: ioMock,
}));

describe('SocketIoPartyObservationAdapter', () => {
  beforeEach(() => {
    connectMock.mockClear();
    disconnectMock.mockClear();
    emitMock.mockClear();
    ioMock.mockClear();
    onMock.mockClear();
    offMock.mockClear();
    socket.connected = false;
    socket.auth = {};
  });

  it('connects and requests observation by party id', () => {
    const { adapter } = createObservationAdapter();

    const release = adapter.observeParty(partyIdentifier.parse(44), {
      onSnapshot: vi.fn(),
    });

    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(emitMock).toHaveBeenCalledWith('observe-party', { partyId: 44 });

    release();

    expect(emitMock).toHaveBeenCalledWith('stop-observing-party');
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  it('refreshes the socket auth payload when auth tokens change', () => {
    const { adapter, transport } = createObservationAdapter();

    adapter.observeParty(partyIdentifier.parse(44), {
      onSnapshot: vi.fn(),
    });
    transport.setAuthSessionTokens({ accessToken: 'token-1', refreshToken: 'refresh-1' });

    expect(socket.auth).toEqual({ authorization: 'Bearer token-1' });
    expect(disconnectMock).toHaveBeenCalledTimes(1);
    expect(connectMock).toHaveBeenCalledTimes(2);
  });

  it('does not emit duplicate observe requests for the same active party id', () => {
    socket.connected = true;

    const { adapter } = createObservationAdapter();

    adapter.observeParty(partyIdentifier.parse(44), {
      onSnapshot: vi.fn(),
    });
    adapter.observeParty(partyIdentifier.parse(44), {
      onSnapshot: vi.fn(),
    });

    expect(emitMock).toHaveBeenCalledTimes(1);
    expect(emitMock).toHaveBeenCalledWith('observe-party', { partyId: 44 });
  });

  it('observes host lobby routes by party id', () => {
    const { adapter } = createObservationAdapter();

    adapter.observeParty(partyIdentifier.parse(44), {
      onSnapshot: vi.fn(),
    });

    expect(emitMock).toHaveBeenCalledWith('observe-party', { partyId: 44 });
  });

  it('dispatches rollback runtime notices to observers of the matching party', () => {
    const onRuntimeNotice = vi.fn();
    const { adapter } = createObservationAdapter();

    adapter.observeParty(partyIdentifier.parse(44), {
      onRuntimeNotice,
      onSnapshot: vi.fn(),
    });

    const runtimeNoticeHandler = onMock.mock.calls.find(
      ([eventName]) => eventName === 'party-runtime-notice',
    )?.[1];

    expect(runtimeNoticeHandler).toBeTypeOf('function');

    runtimeNoticeHandler?.({ kind: 'rewindParty', partyId: 44 });

    expect(onRuntimeNotice).toHaveBeenCalledWith({ kind: 'rewindParty', partyId: 44 });
  });

  it('maps observation snapshots without leaking player identity fields', () => {
    const onSnapshot = vi.fn();
    const { adapter } = createObservationAdapter();

    adapter.observeParty(partyIdentifier.parse(44), { onSnapshot });

    const snapshotHandler = onMock.mock.calls.find(
      ([eventName]) => eventName === 'party-snapshot',
    )?.[1];

    expect(snapshotHandler).toBeTypeOf('function');

    snapshotHandler?.({
      partyId: 44,
      gameType: GameType.Quiz,
      pin: 'AB12CD',
      status: 'WAITING',
      context: null,
      isObserverHost: false,
      host: {
        avatarUri: '/avatars/host.png',
        username: 'Host',
      },
      players: [
        {
          avatarUri: '/avatars/guest-9.png',
          identity: { kind: PartyPlayerIdentityKind.Guest, guestId: 'guest-9' },
          isCurrentPlayer: false,
          isLive: true,
          totalScore: 650,
          username: 'Neo',
        },
      ],
    });

    const observation = onSnapshot.mock.calls[0]?.[0];

    expect(observation).toMatchObject({
      host: {
        avatarUri: '/avatars/host.png',
        username: 'Host',
      },
      isObserverHost: false,
      players: [
        {
          avatarUri: '/avatars/guest-9.png',
          identity: { kind: PartyPlayerIdentityKind.Guest, guestId: 'guest-9' },
          isCurrentPlayer: false,
          isLive: true,
          totalScore: 650,
          username: 'Neo',
        },
      ],
      gameType: GameType.Quiz,
      partyId: 44,
      pin: 'AB12CD',
      status: 'WAITING',
    });
    expect(observation.players[0]).not.toHaveProperty('joinedAt');
    expect(observation.players[0]).not.toHaveProperty('playerKey');
  });

  it('maps accepted guest join acknowledgements to domain receipts', async () => {
    const acceptedGuestJoinReceipt = createAcceptedGuestJoinReceipt();

    emitMock.mockImplementationOnce((eventName, payload, callback) => {
      expect(eventName).toBe('join-party');
      expect(payload).toEqual({ guestId: 'guest-9', pin: 'AB12CD', username: 'Neo' });
      callback(acceptedGuestJoinReceipt);
    });

    const adapter = createPlayerAdapter();

    await expect(
      adapter.joinParty({
        pin: partyPinIdentifier.parse('AB12CD'),
        playerIdentity: {
          kind: PartyPlayerIdentityKind.Guest,
          guestId: guestIdentifier.parse('guest-9'),
        },
        username: 'Neo',
      }),
    ).resolves.toEqual(acceptedGuestJoinReceipt);
  });

  it('maps rejected join acknowledgements to translation keys', async () => {
    emitMock.mockImplementationOnce((_, __, callback) => {
      callback({
        errorCode: 'PLAYER_ALREADY_IN_ACTIVE_PARTY',
        status: PartyJoinReceiptStatus.REJECTED,
      });
    });

    const adapter = createPlayerAdapter();

    await expect(
      adapter.joinParty({
        pin: partyPinIdentifier.parse('AB12CD'),
        playerIdentity: { kind: PartyPlayerIdentityKind.Guest },
      }),
    ).resolves.toEqual({
      errorMessage: 'game.party.errors.playerAlreadyInActiveParty',
      status: PartyJoinReceiptStatus.REJECTED,
    });
  });

  it('returns the leave acknowledgement result', async () => {
    emitMock.mockImplementationOnce((eventName, callback) => {
      expect(eventName).toBe('leave-party');
      callback({ left: true });
    });

    const adapter = createPlayerAdapter();

    await expect(adapter.leaveParty()).resolves.toBe(true);
  });

  it('dispatches host runtime commands through the existing socket connection', async () => {
    emitMock.mockImplementationOnce((eventName, payload, callback) => {
      expect(eventName).toBe('start-party');
      expect(payload).toEqual({ partyId: 44 });
      callback();
    });

    const { adapter } = createHostControlAdapter();

    await expect(
      adapter.startParty({ partyId: partyIdentifier.parse(44) }),
    ).resolves.toBeUndefined();
  });

  it('re-requests the active party observation after a host runtime command completes', async () => {
    socket.connected = true;

    emitMock.mockImplementation((eventName, _payload, callback) => {
      if (eventName === 'start-party') {
        callback?.();
      }
    });

    const { adapter, transport } = createHostControlAdapter();

    transport.observeParty(partyIdentifier.parse(44), {
      onSnapshot: vi.fn(),
    });
    emitMock.mockClear();

    await expect(
      adapter.startParty({ partyId: partyIdentifier.parse(44) }),
    ).resolves.toBeUndefined();

    expect(emitMock.mock.calls).toEqual([
      ['start-party', { partyId: 44 }, expect.any(Function)],
      ['observe-party', { partyId: 44 }],
    ]);
  });

  it('rejects host runtime commands when the socket reports an exception', async () => {
    emitMock.mockImplementationOnce(() => undefined);

    const { adapter } = createHostControlAdapter();
    const pendingCommand = adapter.pauseParty({ partyId: partyIdentifier.parse(44) });
    const exceptionHandler = onMock.mock.calls.find((call) => call[0] === 'exception')?.[1] as
      | ((payload?: { message?: string }) => void)
      | undefined;

    expect(exceptionHandler).toBeTypeOf('function');

    if (!exceptionHandler) {
      throw new Error('Expected exception handler to be registered');
    }

    exceptionHandler({ message: 'game.party.errors.partyCommandNotAvailable' });

    await expect(pendingCommand).rejects.toThrow('game.party.errors.partyCommandNotAvailable');
  });
});
