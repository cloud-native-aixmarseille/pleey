import 'reflect-metadata';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GuestIdentifier } from '../../../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../../../application/identity/shared/services/identifiers/user-identifier';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { PartyPlayerKind } from '../../../../domain/game/party/enums/party-player-kind.enum';
import { backendTestIdentifiers } from '../../../../test-utils/branded-identifiers';
import { PartyObserverGateway } from './party-observer-gateway';

const guestIdentifier = new GuestIdentifier();
const partyActionIdentifier = new PartyActionIdentifier();
const partyIdentifier = new PartyIdentifier();
const partyPinIdentifier = new PartyPinIdentifier();
const userIdentifier = new UserIdentifier();
const PARTY_ID = backendTestIdentifiers.party(44);
const GAME_ID = backendTestIdentifiers.game(17);
const HOST_USER_ID = backendTestIdentifiers.user(7);
const PLAYER_USER_ID = backendTestIdentifiers.user(11);
const GUEST_ID = backendTestIdentifiers.guest('guest-7');
const PARTY_PIN = partyPinIdentifier.parse('123456');
const PARTY_ROOM = `party:${PARTY_ID}`;

function createPartyPlayerSessionRegistryMock() {
  return {
    registerSession: vi.fn((_: unknown, __: unknown, sessionId: string) => ({
      sessionId,
      previousSessionId: null,
    })),
    hasActiveSession: vi.fn().mockReturnValue(false),
    getActiveSession: vi.fn().mockReturnValue(null),
    invalidateSession: vi.fn().mockReturnValue(false),
    invalidateAllSessions: vi.fn(),
  };
}

function createHostControlUseCases() {
  return [
    { execute: vi.fn() } as never,
    { execute: vi.fn() } as never,
    { execute: vi.fn() } as never,
    { execute: vi.fn() } as never,
    { execute: vi.fn() } as never,
    { execute: vi.fn() } as never,
    { execute: vi.fn() } as never,
    { execute: vi.fn() } as never,
    { execute: vi.fn() } as never,
    { execute: vi.fn() } as never,
  ] as const;
}

function createHostControlGateway() {
  const partyObservationBroadcaster = {
    attachServer: vi.fn(),
    emitSnapshot: vi.fn(),
    publishRuntimeNotice: vi.fn().mockResolvedValue(undefined),
  };
  const sessionRegistry = createPartyPlayerSessionRegistryMock();
  const startPartyUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const advanceStageUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const restartStageUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const rewindStageUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const rewindPartyUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const pausePartyUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const resumePartyUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const revealStageResultUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const endPartyUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const kickPartyPlayerUseCase = { execute: vi.fn().mockResolvedValue(undefined) };

  return {
    gateway: new PartyObserverGateway(
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      partyObservationBroadcaster as never,
      guestIdentifier,
      partyActionIdentifier,
      partyIdentifier,
      partyPinIdentifier,
      userIdentifier,
      startPartyUseCase as never,
      advanceStageUseCase as never,
      restartStageUseCase as never,
      rewindStageUseCase as never,
      rewindPartyUseCase as never,
      pausePartyUseCase as never,
      resumePartyUseCase as never,
      revealStageResultUseCase as never,
      endPartyUseCase as never,
      kickPartyPlayerUseCase as never,
      sessionRegistry as never,
    ),
    useCases: {
      advanceStageUseCase,
      endPartyUseCase,
      kickPartyPlayerUseCase,
      pausePartyUseCase,
      restartStageUseCase,
      resumePartyUseCase,
      revealStageResultUseCase,
      rewindPartyUseCase,
      rewindStageUseCase,
      startPartyUseCase,
    },
    partyObservationBroadcaster,
    sessionRegistry,
  };
}

function createSnapshot() {
  return {
    hostObservation: {
      partyId: PARTY_ID,
      gameId: GAME_ID,
      pin: PARTY_PIN,
      status: 'WAITING',
      context: null,
      host: {
        avatarUri: null,
        userId: HOST_USER_ID,
        username: 'Host',
      },
      players: [],
      createdAt: new Date('2026-04-17T10:00:00.000Z'),
      updatedAt: new Date('2026-04-17T10:00:00.000Z'),
    },
    playerObservation: {
      partyId: PARTY_ID,
      pin: PARTY_PIN,
      status: 'WAITING',
      context: null,
      host: {
        avatarUri: null,
        username: 'Host',
      },
      playerActionStates: [],
      players: [],
    },
  };
}

describe('PartyObserverGateway', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('joins the party room by party id and emits the current snapshot', async () => {
    const loadPartyObservationSnapshotUseCase = {
      execute: vi.fn().mockResolvedValue(createSnapshot()),
    };
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const partyObservationBroadcaster = {
      attachServer: vi.fn(),
      emitSnapshot: vi.fn().mockResolvedValue(undefined),
    };
    const gateway = new PartyObserverGateway(
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      loadPartyObservationSnapshotUseCase as never,
      broadcastPartyObservationUseCase as never,
      partyObservationBroadcaster as never,
      guestIdentifier,
      partyActionIdentifier,
      partyIdentifier,
      partyPinIdentifier,
      userIdentifier,
      ...createHostControlUseCases(),
      createPartyPlayerSessionRegistryMock() as never,
    );
    const client = {
      data: {},
      emit: vi.fn(),
      join: vi.fn().mockResolvedValue(undefined),
      leave: vi.fn().mockResolvedValue(undefined),
    };

    await gateway.observeParty(client as never, { partyId: PARTY_ID });

    expect(loadPartyObservationSnapshotUseCase.execute).toHaveBeenCalledWith({
      partyId: PARTY_ID,
    });
    expect(client.join).toHaveBeenCalledWith(PARTY_ROOM);
    expect(partyObservationBroadcaster.emitSnapshot).toHaveBeenCalled();
  });

  it('observes a host lobby by party id', async () => {
    const loadPartyObservationSnapshotUseCase = {
      execute: vi.fn().mockResolvedValue(createSnapshot()),
    };
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const partyObservationBroadcaster = {
      attachServer: vi.fn(),
      emitSnapshot: vi.fn().mockResolvedValue(undefined),
    };
    const gateway = new PartyObserverGateway(
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      loadPartyObservationSnapshotUseCase as never,
      broadcastPartyObservationUseCase as never,
      partyObservationBroadcaster as never,
      guestIdentifier,
      partyActionIdentifier,
      partyIdentifier,
      partyPinIdentifier,
      userIdentifier,
      ...createHostControlUseCases(),
      createPartyPlayerSessionRegistryMock() as never,
    );

    await gateway.observeParty(
      {
        data: {},
        emit: vi.fn(),
        join: vi.fn().mockResolvedValue(undefined),
        leave: vi.fn().mockResolvedValue(undefined),
      } as never,
      { partyId: PARTY_ID },
    );

    expect(loadPartyObservationSnapshotUseCase.execute).toHaveBeenCalledWith({
      partyId: PARTY_ID,
    });
  });

  it('throws a websocket exception when the party cannot be observed', async () => {
    const gateway = new PartyObserverGateway(
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      {
        execute: vi.fn().mockRejectedValue(new Error(GameErrorCode.PARTY_NOT_FOUND)),
      } as never,
      {
        execute: vi.fn().mockResolvedValue(undefined),
      } as never,
      {
        attachServer: vi.fn(),
        emitSnapshot: vi.fn().mockResolvedValue(undefined),
      } as never,
      guestIdentifier,
      partyActionIdentifier,
      partyIdentifier,
      partyPinIdentifier,
      userIdentifier,
      ...createHostControlUseCases(),
      createPartyPlayerSessionRegistryMock() as never,
    );

    await expect(
      gateway.observeParty({ data: {}, leave: vi.fn() } as never, { partyId: undefined }),
    ).rejects.toMatchObject({
      message: GameErrorCode.VALIDATION_FAILED,
    });
  });

  it('returns an accepted acknowledgement for authenticated joins and stores socket player metadata', async () => {
    const joinPartyUseCase = {
      execute: vi.fn().mockResolvedValue({
        partyId: PARTY_ID,
        gameId: GAME_ID,
        pin: PARTY_PIN,
        player: {
          identity: { kind: PartyPlayerKind.USER, userId: HOST_USER_ID },
          username: 'Neo',
          avatarUri: '/api/avatars/users/7?v=1',
          totalScore: 0,
          joinedAt: new Date('2026-04-17T10:00:00.000Z'),
        },
      }),
    };
    const loadPartyObservationSnapshotUseCase = {
      execute: vi.fn().mockResolvedValue(createSnapshot()),
    };
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const partyObservationBroadcaster = {
      attachServer: vi.fn(),
      emitSnapshot: vi.fn().mockResolvedValue(undefined),
    };
    const gateway = new PartyObserverGateway(
      joinPartyUseCase as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      loadPartyObservationSnapshotUseCase as never,
      broadcastPartyObservationUseCase as never,
      partyObservationBroadcaster as never,
      guestIdentifier,
      partyActionIdentifier,
      partyIdentifier,
      partyPinIdentifier,
      userIdentifier,
      ...createHostControlUseCases(),
      createPartyPlayerSessionRegistryMock() as never,
    );
    const client = {
      data: {
        authenticatedUserId: HOST_USER_ID,
      },
      emit: vi.fn(),
      join: vi.fn().mockResolvedValue(undefined),
      leave: vi.fn().mockResolvedValue(undefined),
    };

    const result = await gateway.joinParty(client as never, { pin: '123456' });

    expect(joinPartyUseCase.execute).toHaveBeenCalledWith({
      avatarSeed: undefined,
      pin: PARTY_PIN,
      playerIdentity: { kind: PartyPlayerKind.USER, userId: HOST_USER_ID },
      username: '',
    });
    expect(result).toEqual(
      expect.objectContaining({
        status: 'accepted',
        player: expect.objectContaining({
          identity: { kind: PartyPlayerKind.USER, userId: HOST_USER_ID },
        }),
      }),
    );
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({ partyId: PARTY_ID });
    expect(client.data).toMatchObject({
      joinedPartyPlayer: {
        identity: { kind: PartyPlayerKind.USER, userId: HOST_USER_ID },
        pin: PARTY_PIN,
      },
      partyObservationRoom: PARTY_ROOM,
    });
  });

  it('returns a rejected acknowledgement when a join fails validation', async () => {
    const gateway = new PartyObserverGateway(
      {
        execute: vi.fn().mockRejectedValue(new Error(GameErrorCode.PLAYER_ALREADY_IN_ACTIVE_PARTY)),
      } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      {
        execute: vi.fn().mockResolvedValue(undefined),
      } as never,
      {
        execute: vi.fn().mockResolvedValue(undefined),
      } as never,
      {
        attachServer: vi.fn(),
        emitSnapshot: vi.fn().mockResolvedValue(undefined),
      } as never,
      guestIdentifier,
      partyActionIdentifier,
      partyIdentifier,
      partyPinIdentifier,
      userIdentifier,
      ...createHostControlUseCases(),
      createPartyPlayerSessionRegistryMock() as never,
    );

    await expect(
      gateway.joinParty(
        {
          data: { authenticatedUserId: HOST_USER_ID },
          join: vi.fn(),
          leave: vi.fn(),
        } as never,
        { pin: '123456' },
      ),
    ).resolves.toEqual({
      errorCode: GameErrorCode.PLAYER_ALREADY_IN_ACTIVE_PARTY,
      status: 'rejected',
    });
  });

  it('forwards trimmed guest avatar seeds on guest joins', async () => {
    const joinPartyUseCase = {
      execute: vi.fn().mockResolvedValue({
        partyId: PARTY_ID,
        gameId: GAME_ID,
        pin: PARTY_PIN,
        player: {
          identity: { kind: PartyPlayerKind.GUEST, guestId: GUEST_ID },
          username: 'Nova Otter 418',
          avatarUri: '/api/avatars/guests/guest-7',
          totalScore: 0,
          joinedAt: new Date('2026-04-17T10:00:00.000Z'),
        },
      }),
    };
    const gateway = new PartyObserverGateway(
      joinPartyUseCase as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn().mockResolvedValue(createSnapshot()) } as never,
      { execute: vi.fn().mockResolvedValue(undefined) } as never,
      {
        attachServer: vi.fn(),
        emitSnapshot: vi.fn().mockResolvedValue(undefined),
      } as never,
      guestIdentifier,
      partyActionIdentifier,
      partyIdentifier,
      partyPinIdentifier,
      userIdentifier,
      ...createHostControlUseCases(),
      createPartyPlayerSessionRegistryMock() as never,
    );

    await gateway.joinParty(
      {
        data: {},
        join: vi.fn().mockResolvedValue(undefined),
        leave: vi.fn().mockResolvedValue(undefined),
      } as never,
      {
        avatarSeed: '  neon-seed  ',
        pin: '123456',
        username: 'Nova Otter 418',
      },
    );

    expect(joinPartyUseCase.execute).toHaveBeenCalledWith({
      avatarSeed: 'neon-seed',
      pin: PARTY_PIN,
      playerIdentity: { kind: PartyPlayerKind.GUEST },
      username: 'Nova Otter 418',
    });
  });

  it('publishes a corrected room update after a player leaves', async () => {
    const leavePartyUseCase = {
      execute: vi.fn().mockResolvedValue(true),
    };
    const loadPartyObservationSnapshotUseCase = {
      execute: vi.fn().mockResolvedValue(createSnapshot()),
    };
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const partyObservationBroadcaster = {
      attachServer: vi.fn(),
      emitSnapshot: vi.fn().mockResolvedValue(undefined),
    };
    const gateway = new PartyObserverGateway(
      { execute: vi.fn() } as never,
      leavePartyUseCase as never,
      { execute: vi.fn() } as never,
      loadPartyObservationSnapshotUseCase as never,
      broadcastPartyObservationUseCase as never,
      partyObservationBroadcaster as never,
      guestIdentifier,
      partyActionIdentifier,
      partyIdentifier,
      partyPinIdentifier,
      userIdentifier,
      ...createHostControlUseCases(),
      createPartyPlayerSessionRegistryMock() as never,
    );
    const client = {
      data: {
        joinedPartyPlayer: {
          identity: { kind: PartyPlayerKind.USER, userId: HOST_USER_ID },
          pin: PARTY_PIN,
        },
        partyObservationRoom: PARTY_ROOM,
        authenticatedUserId: HOST_USER_ID,
      },
      leave: vi.fn().mockResolvedValue(undefined),
    };

    await expect(gateway.leaveParty(client as never)).resolves.toEqual({ left: true });

    expect(leavePartyUseCase.execute).toHaveBeenCalledWith({
      pin: PARTY_PIN,
      playerIdentity: { kind: PartyPlayerKind.USER, userId: HOST_USER_ID },
    });
    expect(client.leave).toHaveBeenCalledWith(PARTY_ROOM);
    expect(client.data).toEqual({ authenticatedUserId: HOST_USER_ID });
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({ partyId: PARTY_ID });
  });

  it('waits for the socket to leave the room before republishing after leave', async () => {
    const leavePartyUseCase = {
      execute: vi.fn().mockResolvedValue(true),
    };
    const loadPartyObservationSnapshotUseCase = {
      execute: vi.fn().mockResolvedValue(createSnapshot()),
    };
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const partyObservationBroadcaster = {
      attachServer: vi.fn(),
      emitSnapshot: vi.fn().mockResolvedValue(undefined),
    };
    const gateway = new PartyObserverGateway(
      { execute: vi.fn() } as never,
      leavePartyUseCase as never,
      { execute: vi.fn() } as never,
      loadPartyObservationSnapshotUseCase as never,
      broadcastPartyObservationUseCase as never,
      partyObservationBroadcaster as never,
      guestIdentifier,
      partyActionIdentifier,
      partyIdentifier,
      partyPinIdentifier,
      userIdentifier,
      ...createHostControlUseCases(),
      createPartyPlayerSessionRegistryMock() as never,
    );

    let resolveLeave!: () => void;
    const leavePromise = new Promise<void>((resolve) => {
      resolveLeave = resolve;
    });
    const client = {
      data: {
        joinedPartyPlayer: {
          identity: { kind: PartyPlayerKind.USER, userId: HOST_USER_ID },
          pin: PARTY_PIN,
        },
        partyObservationRoom: PARTY_ROOM,
        authenticatedUserId: HOST_USER_ID,
      },
      leave: vi.fn().mockReturnValue(leavePromise),
    };

    const pendingLeave = gateway.leaveParty(client as never);

    expect(broadcastPartyObservationUseCase.execute).not.toHaveBeenCalled();

    resolveLeave();
    await pendingLeave;

    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({ partyId: PARTY_ID });
  });

  it('kicks a targeted player and clears the matched joined-player socket metadata', async () => {
    const { gateway, useCases } = createHostControlGateway();
    const removedPlayerSocket = {
      data: {
        joinedPartyPlayer: {
          identity: { kind: PartyPlayerKind.GUEST, guestId: GUEST_ID },
          pin: PARTY_PIN,
        },
      },
    };

    gateway.afterInit({
      in: vi.fn().mockReturnValue({
        fetchSockets: vi.fn().mockResolvedValue([removedPlayerSocket]),
      }),
    } as never);

    await gateway.kickPlayer(
      {
        data: {
          authenticatedUserId: backendTestIdentifiers.user(7),
        },
      } as never,
      {
        guestId: backendTestIdentifiers.guest('guest-7'),
        partyId: backendTestIdentifiers.party(44),
      },
    );

    expect(useCases.kickPartyPlayerUseCase.execute).toHaveBeenCalledWith({
      hostUserId: backendTestIdentifiers.user(7),
      partyId: backendTestIdentifiers.party(44),
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
        guestId: backendTestIdentifiers.guest('guest-7'),
      },
    });
    expect(removedPlayerSocket.data.joinedPartyPlayer).toBeUndefined();
  });

  it('prunes a disconnected waiting player after the grace period', async () => {
    vi.useFakeTimers();

    const leavePartyUseCase = {
      execute: vi.fn().mockResolvedValue(true),
    };
    const loadPartyObservationSnapshotUseCase = {
      execute: vi.fn().mockResolvedValue(createSnapshot()),
    };
    const gateway = new PartyObserverGateway(
      { execute: vi.fn() } as never,
      leavePartyUseCase as never,
      { execute: vi.fn() } as never,
      loadPartyObservationSnapshotUseCase as never,
      { execute: vi.fn() } as never,
      { attachServer: vi.fn(), emitSnapshot: vi.fn().mockResolvedValue(undefined) } as never,
      guestIdentifier,
      partyActionIdentifier,
      partyIdentifier,
      partyPinIdentifier,
      userIdentifier,
      ...createHostControlUseCases(),
      createPartyPlayerSessionRegistryMock() as never,
    );

    gateway.afterInit({
      in: vi.fn().mockReturnValue({ fetchSockets: vi.fn().mockResolvedValue([]) }),
    } as never);

    gateway.handleDisconnect({
      data: {
        joinedPartyPlayer: {
          identity: { kind: PartyPlayerKind.USER, userId: HOST_USER_ID },
          pin: PARTY_PIN,
        },
        partyObservationRoom: PARTY_ROOM,
      },
      leave: vi.fn().mockResolvedValue(undefined),
    } as never);

    await vi.runAllTimersAsync();

    expect(loadPartyObservationSnapshotUseCase.execute).toHaveBeenCalledWith({
      partyId: PARTY_ID,
    });
    expect(leavePartyUseCase.execute).toHaveBeenCalledWith({
      pin: PARTY_PIN,
      playerIdentity: { kind: PartyPlayerKind.USER, userId: HOST_USER_ID },
    });
  });

  it('does not prune a waiting player who is still connected through another party socket', async () => {
    vi.useFakeTimers();

    const leavePartyUseCase = {
      execute: vi.fn().mockResolvedValue(true),
    };
    const loadPartyObservationSnapshotUseCase = {
      execute: vi.fn().mockResolvedValue(createSnapshot()),
    };
    const gateway = new PartyObserverGateway(
      { execute: vi.fn() } as never,
      leavePartyUseCase as never,
      { execute: vi.fn() } as never,
      loadPartyObservationSnapshotUseCase as never,
      { execute: vi.fn() } as never,
      { attachServer: vi.fn(), emitSnapshot: vi.fn().mockResolvedValue(undefined) } as never,
      guestIdentifier,
      partyActionIdentifier,
      partyIdentifier,
      partyPinIdentifier,
      userIdentifier,
      ...createHostControlUseCases(),
      createPartyPlayerSessionRegistryMock() as never,
    );

    gateway.afterInit({
      in: vi.fn().mockReturnValue({
        fetchSockets: vi.fn().mockResolvedValue([
          {
            data: {
              joinedPartyPlayer: {
                identity: { kind: PartyPlayerKind.USER, userId: HOST_USER_ID },
                pin: PARTY_PIN,
              },
            },
          },
        ]),
      }),
    } as never);

    gateway.handleDisconnect({
      data: {
        joinedPartyPlayer: {
          identity: { kind: PartyPlayerKind.USER, userId: HOST_USER_ID },
          pin: PARTY_PIN,
        },
        partyObservationRoom: PARTY_ROOM,
      },
      leave: vi.fn().mockResolvedValue(undefined),
    } as never);

    await vi.runAllTimersAsync();

    expect(loadPartyObservationSnapshotUseCase.execute).not.toHaveBeenCalled();
    expect(leavePartyUseCase.execute).not.toHaveBeenCalled();
  });

  it('prunes a waiting player who stops observing the party for too long', async () => {
    vi.useFakeTimers();

    const leavePartyUseCase = {
      execute: vi.fn().mockResolvedValue(true),
    };
    const loadPartyObservationSnapshotUseCase = {
      execute: vi.fn().mockResolvedValue(createSnapshot()),
    };
    const gateway = new PartyObserverGateway(
      { execute: vi.fn() } as never,
      leavePartyUseCase as never,
      { execute: vi.fn() } as never,
      loadPartyObservationSnapshotUseCase as never,
      { execute: vi.fn() } as never,
      { attachServer: vi.fn(), emitSnapshot: vi.fn().mockResolvedValue(undefined) } as never,
      guestIdentifier,
      partyActionIdentifier,
      partyIdentifier,
      partyPinIdentifier,
      userIdentifier,
      ...createHostControlUseCases(),
      createPartyPlayerSessionRegistryMock() as never,
    );

    gateway.afterInit({
      in: vi.fn().mockReturnValue({ fetchSockets: vi.fn().mockResolvedValue([]) }),
    } as never);

    const client = {
      data: {
        joinedPartyPlayer: {
          identity: { kind: PartyPlayerKind.USER, userId: HOST_USER_ID },
          pin: PARTY_PIN,
        },
        partyObservationRoom: PARTY_ROOM,
      },
      leave: vi.fn().mockResolvedValue(undefined),
    };

    await gateway.stopObservingParty(client as never);
    await vi.runAllTimersAsync();

    // stopObservingParty should NOT trigger a prune; observation is separate from membership
    expect(client.data).toEqual({
      joinedPartyPlayer: {
        identity: { kind: PartyPlayerKind.USER, userId: HOST_USER_ID },
        pin: PARTY_PIN,
      },
    });
    expect(leavePartyUseCase.execute).not.toHaveBeenCalled();
  });

  it.each([
    [
      'start-party',
      (gateway: PartyObserverGateway) =>
        gateway.startParty({ data: { authenticatedUserId: HOST_USER_ID } } as never, {
          partyId: PARTY_ID,
        }),
      'startPartyUseCase',
    ],
    [
      'advance-stage',
      (gateway: PartyObserverGateway) =>
        gateway.advanceStage({ data: { authenticatedUserId: HOST_USER_ID } } as never, {
          partyId: PARTY_ID,
        }),
      'advanceStageUseCase',
    ],
    [
      'restart-stage',
      (gateway: PartyObserverGateway) =>
        gateway.restartStage({ data: { authenticatedUserId: HOST_USER_ID } } as never, {
          partyId: PARTY_ID,
        }),
      'restartStageUseCase',
    ],
    [
      'rewind-stage',
      (gateway: PartyObserverGateway) =>
        gateway.rewindStage({ data: { authenticatedUserId: HOST_USER_ID } } as never, {
          partyId: PARTY_ID,
        }),
      'rewindStageUseCase',
    ],
    [
      'rewind-party',
      (gateway: PartyObserverGateway) =>
        gateway.rewindParty({ data: { authenticatedUserId: HOST_USER_ID } } as never, {
          partyId: PARTY_ID,
        }),
      'rewindPartyUseCase',
    ],
    [
      'pause-party',
      (gateway: PartyObserverGateway) =>
        gateway.pauseParty({ data: { authenticatedUserId: HOST_USER_ID } } as never, {
          partyId: PARTY_ID,
        }),
      'pausePartyUseCase',
    ],
    [
      'resume-party',
      (gateway: PartyObserverGateway) =>
        gateway.resumeParty({ data: { authenticatedUserId: HOST_USER_ID } } as never, {
          partyId: PARTY_ID,
        }),
      'resumePartyUseCase',
    ],
    [
      'reveal-stage-result',
      (gateway: PartyObserverGateway) =>
        gateway.revealStageResult({ data: { authenticatedUserId: HOST_USER_ID } } as never, {
          partyId: PARTY_ID,
        }),
      'revealStageResultUseCase',
    ],
    [
      'end-party',
      (gateway: PartyObserverGateway) =>
        gateway.endParty({ data: { authenticatedUserId: HOST_USER_ID } } as never, {
          partyId: PARTY_ID,
        }),
      'endPartyUseCase',
    ],
  ] as const)('routes %s through the authenticated host use case', async (_eventName, invoke, useCaseName) => {
    const { gateway, useCases } = createHostControlGateway();

    await invoke(gateway);

    expect(useCases[useCaseName].execute).toHaveBeenCalledWith({
      hostUserId: HOST_USER_ID,
      partyId: PARTY_ID,
    });
  });

  it('clears all live sessions after ending the party', async () => {
    const { gateway, sessionRegistry } = createHostControlGateway();

    await gateway.endParty({ data: { authenticatedUserId: HOST_USER_ID } } as never, {
      partyId: PARTY_ID,
    });

    expect(sessionRegistry.invalidateAllSessions).toHaveBeenCalledWith(PARTY_ID);
  });

  it.each([
    [
      'restart-stage',
      (gateway: PartyObserverGateway) =>
        gateway.restartStage({ data: { authenticatedUserId: HOST_USER_ID } } as never, {
          partyId: PARTY_ID,
        }),
      'restartStage',
    ],
    [
      'rewind-stage',
      (gateway: PartyObserverGateway) =>
        gateway.rewindStage({ data: { authenticatedUserId: HOST_USER_ID } } as never, {
          partyId: PARTY_ID,
        }),
      'rewindStage',
    ],
    [
      'rewind-party',
      (gateway: PartyObserverGateway) =>
        gateway.rewindParty({ data: { authenticatedUserId: HOST_USER_ID } } as never, {
          partyId: PARTY_ID,
        }),
      'rewindParty',
    ],
  ] as const)('publishes a rollback notice after %s succeeds', async (_eventName, invoke, runtimeNoticeKind) => {
    const { gateway, partyObservationBroadcaster } = createHostControlGateway();

    await invoke(gateway);

    expect(partyObservationBroadcaster.publishRuntimeNotice).toHaveBeenCalledWith(
      PARTY_ID,
      HOST_USER_ID,
      runtimeNoticeKind,
    );
  });

  it('rejects unauthenticated host controls', async () => {
    const { gateway, useCases } = createHostControlGateway();

    await expect(
      gateway.pauseParty(
        {
          data: {},
        } as never,
        { partyId: PARTY_ID },
      ),
    ).rejects.toMatchObject({
      message: GameErrorCode.HOST_PARTY_CONTROL_FORBIDDEN,
    });
    expect(useCases.pausePartyUseCase.execute).not.toHaveBeenCalled();
  });

  it('routes submit-action through the joined player identity', async () => {
    const submitPartyActionUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const gateway = new PartyObserverGateway(
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      submitPartyActionUseCase as never,
      { execute: vi.fn() } as never,
      { execute: vi.fn() } as never,
      { attachServer: vi.fn(), emitSnapshot: vi.fn() } as never,
      guestIdentifier,
      partyActionIdentifier,
      partyIdentifier,
      partyPinIdentifier,
      userIdentifier,
      ...createHostControlUseCases(),
      createPartyPlayerSessionRegistryMock() as never,
    );

    await gateway.submitAction(
      {
        data: {
          joinedPartyPlayer: {
            identity: { kind: PartyPlayerKind.USER, userId: PLAYER_USER_ID },
            pin: PARTY_PIN,
          },
          partyObservationRoom: PARTY_ROOM,
        },
      } as never,
      {
        actionId: backendTestIdentifiers.partyAction(2),
        partyId: backendTestIdentifiers.party(44),
      },
    );

    expect(submitPartyActionUseCase.execute).toHaveBeenCalledWith({
      actionId: backendTestIdentifiers.partyAction(2),
      partyId: backendTestIdentifiers.party(44),
      playerIdentity: { kind: PartyPlayerKind.USER, userId: PLAYER_USER_ID },
    });
  });
});
