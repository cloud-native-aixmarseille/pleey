import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PartyPinIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GameTypeParser } from '../../../../application/game/types/shared/services/game-type-parser';
import { PartyJoinReceiptStatus } from '../../../../domains/game/party/player/ports/party-player.port';
import { PartyPlayerIdentityKind } from '../../../../domains/game/party/shared/entities/party-player-identity';
import { GameType } from '../../../../domains/game/types/shared/game-type';
import { GameIdentifierMockFactory } from '../../../../test-utils/mocks/game-identifier-mock-factory';
import { GuestIdentifierMockFactory } from '../../../../test-utils/mocks/guest-identifier-mock-factory';
import { PartyActionIdentifierMockFactory } from '../../../../test-utils/mocks/party-action-identifier-mock-factory';
import { PartyIdentifierMockFactory } from '../../../../test-utils/mocks/party-identifier-mock-factory';
import { UserIdentifierMockFactory } from '../../../../test-utils/mocks/user-identifier-mock-factory';
import { SocketIoPartyHostControlAdapter } from '../host/socket-io-party-host-control.adapter';
import { SocketIoPartyPlayerAdapter } from '../player/socket-io-party-player.adapter';
import { SocketIoPartyObservationAdapter } from './socket-io-party-observation.adapter';
import { SocketIoPartyPayloadMapper } from './socket-io-party-payload-mapper';
import { SocketIoPartyRealtimeTransport } from './socket-io-party-realtime-transport';

const guestIdentifier = new GuestIdentifierMockFactory().create();
const userIdentifier = new UserIdentifierMockFactory().create();
const partyIdentifier = new PartyIdentifierMockFactory().create();
const partyPinIdentifier = new PartyPinIdentifier();
const partyActionIdentifier = new PartyActionIdentifierMockFactory().create();
const gameIdentifier = new GameIdentifierMockFactory().create();
const gameTypeParser = new GameTypeParser();
const PARTY_ID = partyIdentifier.parse(44);
const GAME_ID = gameIdentifier.parse(17);
const GUEST_ID = guestIdentifier.parse('guest-9');
const ACTION_ID = partyActionIdentifier.parse(100);

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
    gameId: GAME_ID,
    player: {
      avatarUri: '/avatars/guest-9.png',
      identity: { kind: PartyPlayerIdentityKind.Guest, guestId: GUEST_ID },
      username: 'Neo',
    },
    partyId: PARTY_ID,
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

    const release = adapter.observeParty(PARTY_ID, {
      onSnapshot: vi.fn(),
    });

    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(emitMock).toHaveBeenCalledWith('observe-party', { partyId: PARTY_ID });

    release();

    expect(emitMock).toHaveBeenCalledWith('stop-observing-party');
    expect(disconnectMock).toHaveBeenCalledTimes(1);
  });

  it('refreshes the socket auth payload when auth tokens change', () => {
    const { adapter, transport } = createObservationAdapter();

    adapter.observeParty(PARTY_ID, {
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

    adapter.observeParty(PARTY_ID, {
      onSnapshot: vi.fn(),
    });
    adapter.observeParty(PARTY_ID, {
      onSnapshot: vi.fn(),
    });

    expect(emitMock).toHaveBeenCalledTimes(1);
    expect(emitMock).toHaveBeenCalledWith('observe-party', { partyId: PARTY_ID });
  });

  it('observes host lobby routes by party id', () => {
    const { adapter } = createObservationAdapter();

    adapter.observeParty(PARTY_ID, {
      onSnapshot: vi.fn(),
    });

    expect(emitMock).toHaveBeenCalledWith('observe-party', { partyId: PARTY_ID });
  });

  it('dispatches rollback runtime notices to observers of the matching party', () => {
    const onRuntimeNotice = vi.fn();
    const { adapter } = createObservationAdapter();

    adapter.observeParty(PARTY_ID, {
      onRuntimeNotice,
      onSnapshot: vi.fn(),
    });

    const runtimeNoticeHandler = onMock.mock.calls.find(
      ([eventName]) => eventName === 'party-runtime-notice',
    )?.[1];

    expect(runtimeNoticeHandler).toBeTypeOf('function');

    runtimeNoticeHandler?.({ kind: 'rewindParty', partyId: 44 });

    expect(onRuntimeNotice).toHaveBeenCalledWith({ kind: 'rewindParty', partyId: PARTY_ID });
  });

  it('maps observation snapshots without leaking player identity fields', () => {
    const onSnapshot = vi.fn();
    const { adapter } = createObservationAdapter();

    adapter.observeParty(PARTY_ID, { onSnapshot });

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
          identity: { kind: PartyPlayerIdentityKind.Guest, guestId: GUEST_ID },
          isCurrentPlayer: false,
          isLive: true,
          totalScore: 650,
          username: 'Neo',
        },
      ],
      gameType: GameType.Quiz,
      partyId: PARTY_ID,
      pin: 'AB12CD',
      status: 'WAITING',
    });
    expect(observation.players[0]).not.toHaveProperty('joinedAt');
    expect(observation.players[0]).not.toHaveProperty('playerKey');
  });

  it('maps stage timer metadata from the snapshot payload', () => {
    const onSnapshot = vi.fn();
    const { adapter } = createObservationAdapter();

    adapter.observeParty(PARTY_ID, { onSnapshot });

    const snapshotHandler = onMock.mock.calls.find(
      ([eventName]) => eventName === 'party-snapshot',
    )?.[1];

    expect(snapshotHandler).toBeTypeOf('function');

    snapshotHandler?.({
      partyId: 44,
      gameType: GameType.Quiz,
      pin: 'AB12CD',
      status: 'ACTIVE',
      context: {
        lifecycle: {
          phase: 'stage',
          stageEndsAtEpochMs: 15_000,
          stageId: 12,
          stagePosition: 0,
          stageRemainingDurationMs: 10_000,
          stageTimeLimitSeconds: 10,
          totalStages: 2,
        },
        stage: {
          actionSubmission: {
            currentPlayer: null,
            submittedPlayerCount: 0,
            totalEligiblePlayerCount: 0,
          },
          current: {
            actions: [{ id: 100, text: 'First answer' }],
            text: 'Who answers first?',
          },
        },
      },
      isObserverHost: false,
      host: {
        avatarUri: '/avatars/host.png',
        username: 'Host',
      },
      players: [],
    });

    expect(onSnapshot.mock.calls[0]?.[0]?.context).toMatchObject({
      lifecycle: {
        phase: 'stage',
        stageEndsAtEpochMs: 15_000,
        stageId: 12,
        stagePosition: 0,
        stageRemainingDurationMs: 10_000,
        stageTimeLimitSeconds: 10,
        totalStages: 2,
      },
      stage: {
        actionSubmission: {
          currentPlayer: null,
          submittedPlayerCount: 0,
          totalEligiblePlayerCount: 0,
        },
        current: {
          actions: [{ id: ACTION_ID, text: 'First answer' }],
          text: 'Who answers first?',
        },
      },
    });
  });

  it('drops malformed stage-phase context instead of throwing during snapshot mapping', () => {
    const onSnapshot = vi.fn();
    const { adapter } = createObservationAdapter();

    adapter.observeParty(PARTY_ID, { onSnapshot });

    const snapshotHandler = onMock.mock.calls.find(
      ([eventName]) => eventName === 'party-snapshot',
    )?.[1];

    expect(snapshotHandler).toBeTypeOf('function');

    expect(() => {
      snapshotHandler?.({
        partyId: 44,
        gameType: GameType.Quiz,
        pin: 'AB12CD',
        status: 'ACTIVE',
        context: {
          lifecycle: {
            phase: 'stage',
            stageEndsAtEpochMs: 15_000,
            stageId: 12,
            stagePosition: 0,
            stageRemainingDurationMs: 10_000,
            stageTimeLimitSeconds: 10,
            totalStages: 2,
          },
        },
        isObserverHost: false,
        host: {
          avatarUri: '/avatars/host.png',
          username: 'Host',
        },
        players: [],
      });
    }).not.toThrow();

    expect(onSnapshot.mock.calls[0]?.[0]?.context).toBeNull();
  });

  it('maps accepted guest join acknowledgements to domain receipts', async () => {
    const acceptedGuestJoinReceipt = createAcceptedGuestJoinReceipt();

    emitMock.mockImplementationOnce((eventName, payload, callback) => {
      expect(eventName).toBe('join-party');
      expect(payload).toEqual({ guestId: GUEST_ID, pin: 'AB12CD', username: 'Neo' });
      callback(acceptedGuestJoinReceipt);
    });

    const adapter = createPlayerAdapter();

    await expect(
      adapter.joinParty({
        pin: partyPinIdentifier.parse('AB12CD'),
        playerIdentity: {
          kind: PartyPlayerIdentityKind.Guest,
          guestId: GUEST_ID,
        },
        username: 'Neo',
      }),
    ).resolves.toEqual(acceptedGuestJoinReceipt);
  });

  it('maps rejected join acknowledgements to translation keys', async () => {
    emitMock.mockImplementationOnce((eventName, payload, callback) => {
      expect(eventName).toBe('join-party');
      expect(payload).toEqual({
        avatarSeed: undefined,
        guestId: undefined,
        pin: 'AB12CD',
        username: undefined,
      });
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
      if (typeof callback !== 'function') {
        throw new Error('Expected leave-party acknowledgement callback');
      }
      callback({ left: true });
    });

    const adapter = createPlayerAdapter();

    await expect(adapter.leaveParty()).resolves.toBe(true);
  });

  it('dispatches host runtime commands through the existing socket connection', async () => {
    emitMock.mockImplementationOnce((eventName, payload, callback) => {
      expect(eventName).toBe('start-party');
      expect(payload).toEqual({ partyId: PARTY_ID });
      if (typeof callback !== 'function') {
        throw new Error('Expected host command acknowledgement callback');
      }
      callback();
    });

    const { adapter } = createHostControlAdapter();

    await expect(adapter.startParty({ partyId: PARTY_ID })).resolves.toBeUndefined();
  });

  it('re-requests the active party observation after a host runtime command completes', async () => {
    socket.connected = true;

    emitMock.mockImplementation((eventName, _payload, callback) => {
      if (eventName === 'start-party') {
        callback?.();
      }
    });

    const { adapter, transport } = createHostControlAdapter();

    transport.observeParty(PARTY_ID, {
      onSnapshot: vi.fn(),
    });
    emitMock.mockClear();

    await expect(adapter.startParty({ partyId: PARTY_ID })).resolves.toBeUndefined();

    expect(emitMock.mock.calls).toEqual([
      ['start-party', { partyId: PARTY_ID }, expect.any(Function)],
      ['observe-party', { partyId: PARTY_ID }],
    ]);
  });

  it('rejects host runtime commands when the socket reports an exception', async () => {
    emitMock.mockImplementationOnce(() => undefined);

    const { adapter } = createHostControlAdapter();
    const pendingCommand = adapter.pauseParty({ partyId: PARTY_ID });
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
