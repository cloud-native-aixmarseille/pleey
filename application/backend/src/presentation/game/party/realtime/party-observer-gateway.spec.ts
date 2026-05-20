import 'reflect-metadata';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PartyActionIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-action-identifier';
import { PartyIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-identifier';
import { PartyPinIdentifier } from '../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GuestIdentifier } from '../../../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../../../application/identity/shared/services/identifiers/user-identifier';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { PartyPlayerKind } from '../../../../domain/game/party/enums/party-player-kind.enum';
import { PartyObserverGateway } from './party-observer-gateway';

const guestIdentifier = new GuestIdentifier();
const partyActionIdentifier = new PartyActionIdentifier();
const partyIdentifier = new PartyIdentifier();
const partyPinIdentifier = new PartyPinIdentifier();
const userIdentifier = new UserIdentifier();

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
  ] as const;
}

function createHostControlGateway() {
  const partyObservationBroadcaster = {
    attachServer: vi.fn(),
    emitSnapshot: vi.fn(),
    publishRuntimeNotice: vi.fn().mockResolvedValue(undefined),
  };
  const startPartyUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const advanceStageUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const restartStageUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const rewindStageUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const rewindPartyUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const pausePartyUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const resumePartyUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const revealStageResultUseCase = { execute: vi.fn().mockResolvedValue(undefined) };
  const endPartyUseCase = { execute: vi.fn().mockResolvedValue(undefined) };

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
    ),
    useCases: {
      advanceStageUseCase,
      endPartyUseCase,
      pausePartyUseCase,
      restartStageUseCase,
      resumePartyUseCase,
      revealStageResultUseCase,
      rewindPartyUseCase,
      rewindStageUseCase,
      startPartyUseCase,
    },
    partyObservationBroadcaster,
  };
}

function createSnapshot() {
  return {
    hostObservation: {
      partyId: 44,
      gameId: 17,
      pin: '123456',
      status: 'WAITING',
      context: null,
      host: {
        avatarUri: null,
        userId: 7,
        username: 'Host',
      },
      players: [],
      createdAt: new Date('2026-04-17T10:00:00.000Z'),
      updatedAt: new Date('2026-04-17T10:00:00.000Z'),
    },
    playerObservation: {
      partyId: 44,
      pin: '123456',
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
    );
    const client = {
      data: {},
      emit: vi.fn(),
      join: vi.fn().mockResolvedValue(undefined),
      leave: vi.fn().mockResolvedValue(undefined),
    };

    await gateway.observeParty(client as never, { partyId: partyIdentifier.parse(44) });

    expect(loadPartyObservationSnapshotUseCase.execute).toHaveBeenCalledWith({
      partyId: partyIdentifier.parse(44),
    });
    expect(client.join).toHaveBeenCalledWith('party:44');
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
    );

    await gateway.observeParty(
      {
        data: {},
        emit: vi.fn(),
        join: vi.fn().mockResolvedValue(undefined),
        leave: vi.fn().mockResolvedValue(undefined),
      } as never,
      { partyId: partyIdentifier.parse(44) },
    );

    expect(loadPartyObservationSnapshotUseCase.execute).toHaveBeenCalledWith({
      partyId: partyIdentifier.parse(44),
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
        partyId: 44,
        gameId: 17,
        pin: '123456',
        player: {
          identity: { kind: PartyPlayerKind.USER, userId: 7 },
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
    );
    const client = {
      data: {
        authenticatedUserId: 7,
      },
      emit: vi.fn(),
      join: vi.fn().mockResolvedValue(undefined),
      leave: vi.fn().mockResolvedValue(undefined),
    };

    const result = await gateway.joinParty(client as never, { pin: '123456' });

    expect(joinPartyUseCase.execute).toHaveBeenCalledWith({
      pin: partyPinIdentifier.parse('123456'),
      playerIdentity: { kind: PartyPlayerKind.USER, userId: userIdentifier.parse(7) },
      username: '',
    });
    expect(result).toEqual(
      expect.objectContaining({
        status: 'accepted',
        player: expect.objectContaining({
          identity: { kind: PartyPlayerKind.USER, userId: 7 },
        }),
      }),
    );
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({ partyId: 44 });
    expect(client.data).toMatchObject({
      joinedPartyPlayer: {
        identity: { kind: PartyPlayerKind.USER, userId: 7 },
        pin: '123456',
      },
      partyObservationRoom: 'party:44',
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
    );

    await expect(
      gateway.joinParty(
        {
          data: { authenticatedUserId: 7 },
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
    );
    const client = {
      data: {
        joinedPartyPlayer: {
          identity: { kind: PartyPlayerKind.USER, userId: 7 },
          pin: '123456',
        },
        partyObservationRoom: 'party:44',
        authenticatedUserId: 7,
      },
      leave: vi.fn().mockResolvedValue(undefined),
    };

    await expect(gateway.leaveParty(client as never)).resolves.toEqual({ left: true });

    expect(leavePartyUseCase.execute).toHaveBeenCalledWith({
      pin: '123456',
      playerIdentity: { kind: PartyPlayerKind.USER, userId: 7 },
    });
    expect(client.leave).toHaveBeenCalledWith('party:44');
    expect(client.data).toEqual({ authenticatedUserId: 7 });
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({ partyId: 44 });
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
    );

    let resolveLeave!: () => void;
    const leavePromise = new Promise<void>((resolve) => {
      resolveLeave = resolve;
    });
    const client = {
      data: {
        joinedPartyPlayer: {
          identity: { kind: PartyPlayerKind.USER, userId: 7 },
          pin: '123456',
        },
        partyObservationRoom: 'party:44',
        authenticatedUserId: 7,
      },
      leave: vi.fn().mockReturnValue(leavePromise),
    };

    const pendingLeave = gateway.leaveParty(client as never);

    expect(broadcastPartyObservationUseCase.execute).not.toHaveBeenCalled();

    resolveLeave();
    await pendingLeave;

    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({ partyId: 44 });
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
    );

    gateway.afterInit({
      in: vi.fn().mockReturnValue({ fetchSockets: vi.fn().mockResolvedValue([]) }),
    } as never);

    gateway.handleDisconnect({
      data: {
        joinedPartyPlayer: {
          identity: { kind: PartyPlayerKind.USER, userId: userIdentifier.parse(7) },
          pin: '123456',
        },
        partyObservationRoom: 'party:44',
      },
      leave: vi.fn().mockResolvedValue(undefined),
    } as never);

    await vi.runAllTimersAsync();

    expect(loadPartyObservationSnapshotUseCase.execute).toHaveBeenCalledWith({
      partyId: partyIdentifier.parse(44),
    });
    expect(leavePartyUseCase.execute).toHaveBeenCalledWith({
      pin: '123456',
      playerIdentity: { kind: PartyPlayerKind.USER, userId: userIdentifier.parse(7) },
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
    );

    gateway.afterInit({
      in: vi.fn().mockReturnValue({
        fetchSockets: vi.fn().mockResolvedValue([
          {
            data: {
              joinedPartyPlayer: {
                identity: { kind: PartyPlayerKind.USER, userId: userIdentifier.parse(7) },
                pin: '123456',
              },
            },
          },
        ]),
      }),
    } as never);

    gateway.handleDisconnect({
      data: {
        joinedPartyPlayer: {
          identity: { kind: PartyPlayerKind.USER, userId: userIdentifier.parse(7) },
          pin: '123456',
        },
        partyObservationRoom: 'party:44',
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
    );

    gateway.afterInit({
      in: vi.fn().mockReturnValue({ fetchSockets: vi.fn().mockResolvedValue([]) }),
    } as never);

    const client = {
      data: {
        joinedPartyPlayer: {
          identity: { kind: PartyPlayerKind.USER, userId: userIdentifier.parse(7) },
          pin: '123456',
        },
        partyObservationRoom: 'party:44',
      },
      leave: vi.fn().mockResolvedValue(undefined),
    };

    await gateway.stopObservingParty(client as never);
    await vi.runAllTimersAsync();

    expect(client.data).toEqual({
      joinedPartyPlayer: {
        identity: { kind: PartyPlayerKind.USER, userId: userIdentifier.parse(7) },
        pin: '123456',
      },
    });
    expect(leavePartyUseCase.execute).toHaveBeenCalledWith({
      pin: '123456',
      playerIdentity: { kind: PartyPlayerKind.USER, userId: userIdentifier.parse(7) },
    });
  });

  it.each([
    [
      'start-party',
      (gateway: PartyObserverGateway) =>
        gateway.startParty({ data: { authenticatedUserId: 7 } } as never, {
          partyId: partyIdentifier.parse(44),
        }),
      'startPartyUseCase',
    ],
    [
      'advance-stage',
      (gateway: PartyObserverGateway) =>
        gateway.advanceStage({ data: { authenticatedUserId: 7 } } as never, {
          partyId: partyIdentifier.parse(44),
        }),
      'advanceStageUseCase',
    ],
    [
      'restart-stage',
      (gateway: PartyObserverGateway) =>
        gateway.restartStage({ data: { authenticatedUserId: 7 } } as never, {
          partyId: partyIdentifier.parse(44),
        }),
      'restartStageUseCase',
    ],
    [
      'rewind-stage',
      (gateway: PartyObserverGateway) =>
        gateway.rewindStage({ data: { authenticatedUserId: 7 } } as never, {
          partyId: partyIdentifier.parse(44),
        }),
      'rewindStageUseCase',
    ],
    [
      'rewind-party',
      (gateway: PartyObserverGateway) =>
        gateway.rewindParty({ data: { authenticatedUserId: 7 } } as never, {
          partyId: partyIdentifier.parse(44),
        }),
      'rewindPartyUseCase',
    ],
    [
      'pause-party',
      (gateway: PartyObserverGateway) =>
        gateway.pauseParty({ data: { authenticatedUserId: 7 } } as never, {
          partyId: partyIdentifier.parse(44),
        }),
      'pausePartyUseCase',
    ],
    [
      'resume-party',
      (gateway: PartyObserverGateway) =>
        gateway.resumeParty({ data: { authenticatedUserId: 7 } } as never, {
          partyId: partyIdentifier.parse(44),
        }),
      'resumePartyUseCase',
    ],
    [
      'reveal-stage-result',
      (gateway: PartyObserverGateway) =>
        gateway.revealStageResult({ data: { authenticatedUserId: 7 } } as never, {
          partyId: partyIdentifier.parse(44),
        }),
      'revealStageResultUseCase',
    ],
    [
      'end-party',
      (gateway: PartyObserverGateway) =>
        gateway.endParty({ data: { authenticatedUserId: 7 } } as never, {
          partyId: partyIdentifier.parse(44),
        }),
      'endPartyUseCase',
    ],
  ] as const)('routes %s through the authenticated host use case', async (_eventName, invoke, useCaseName) => {
    const { gateway, useCases } = createHostControlGateway();

    await invoke(gateway);

    expect(useCases[useCaseName].execute).toHaveBeenCalledWith({
      hostUserId: userIdentifier.parse(7),
      partyId: partyIdentifier.parse(44),
    });
  });

  it.each([
    [
      'restart-stage',
      (gateway: PartyObserverGateway) =>
        gateway.restartStage({ data: { authenticatedUserId: 7 } } as never, {
          partyId: partyIdentifier.parse(44),
        }),
      'restartStage',
    ],
    [
      'rewind-stage',
      (gateway: PartyObserverGateway) =>
        gateway.rewindStage({ data: { authenticatedUserId: 7 } } as never, {
          partyId: partyIdentifier.parse(44),
        }),
      'rewindStage',
    ],
    [
      'rewind-party',
      (gateway: PartyObserverGateway) =>
        gateway.rewindParty({ data: { authenticatedUserId: 7 } } as never, {
          partyId: partyIdentifier.parse(44),
        }),
      'rewindParty',
    ],
  ] as const)('publishes a rollback notice after %s succeeds', async (_eventName, invoke, runtimeNoticeKind) => {
    const { gateway, partyObservationBroadcaster } = createHostControlGateway();

    await invoke(gateway);

    expect(partyObservationBroadcaster.publishRuntimeNotice).toHaveBeenCalledWith(
      partyIdentifier.parse(44),
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
        { partyId: partyIdentifier.parse(44) },
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
    );

    await gateway.submitAction(
      {
        data: {
          joinedPartyPlayer: {
            identity: { kind: PartyPlayerKind.USER, userId: userIdentifier.parse(11) },
            pin: '123456',
          },
          partyObservationRoom: 'party:44',
        },
      } as never,
      { actionId: 2, partyId: partyIdentifier.parse(44) },
    );

    expect(submitPartyActionUseCase.execute).toHaveBeenCalledWith({
      actionId: 2,
      partyId: partyIdentifier.parse(44),
      playerIdentity: { kind: PartyPlayerKind.USER, userId: userIdentifier.parse(11) },
    });
  });
});
