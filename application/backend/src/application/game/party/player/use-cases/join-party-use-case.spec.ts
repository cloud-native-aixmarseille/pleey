import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import type { PartyPlayer } from '../../../../../domain/game/party/player/entities/party-player';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { createPasswordServiceMock } from '../../../../../test-utils/mock-factories/password-service.mock-factory';
import { createPlayerPartyRuntimeMock } from '../../../../../test-utils/mock-factories/player-party-runtime.mock-factory';
import { JoinPartyUseCase } from './join-party-use-case';

const partyPin = backendTestIdentifiers.partyPin('123456');
const activePartyPin = backendTestIdentifiers.partyPin('654321');
const partyId = backendTestIdentifiers.party(12);
const otherPartyId = backendTestIdentifiers.party(99);
const gameId = backendTestIdentifiers.game(21);
const hostUserId = backendTestIdentifiers.user(7);
const playerUserId = backendTestIdentifiers.user(42);
const guestId = backendTestIdentifiers.guest('guest-42');

describe('JoinPartyUseCase', () => {
  it('rejects a new authenticated join when the party has already started', async () => {
    const runtime = createPlayerPartyRuntimeMock({
      findActivePartyByUserId: {
        partyId,
        gameId,
        pin: partyPin,
        status: 'ACTIVE',
      },
      findPartyByPin: {
        partyId,
        gameId,
        hostUserId,
        privatePartyPasswordHash: null,
        settings: {
          allowOptionChangeAfterVoting: false,
          randomizeOptionOrder: false,
          randomizeStageOrder: false,
        },
        pin: partyPin,
        status: 'ACTIVE',
      },
      findPartyPlayer: null,
    });
    const broadcastPartyObservationUseCase = {
      execute: vi.fn(),
    };
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
      createPasswordServiceMock({ compare: true }) as never,
    );

    await expect(
      useCase.execute({
        pin: partyPin,
        playerIdentity: {
          kind: PartyPlayerKind.USER,
          userId: playerUserId,
        },
        username: '',
      }),
    ).rejects.toThrow(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);

    expect(runtime.ensureAuthenticatedPlayer).not.toHaveBeenCalled();
    expect(broadcastPartyObservationUseCase.execute).not.toHaveBeenCalled();
  });

  it('rejects a new guest join when the party has already started', async () => {
    const runtime = createPlayerPartyRuntimeMock({
      findPartyByPin: {
        partyId,
        gameId,
        hostUserId,
        privatePartyPasswordHash: null,
        settings: {
          allowOptionChangeAfterVoting: false,
          randomizeOptionOrder: false,
          randomizeStageOrder: false,
        },
        pin: partyPin,
        status: 'ACTIVE',
      },
    });
    const broadcastPartyObservationUseCase = {
      execute: vi.fn(),
    };
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
      createPasswordServiceMock({ compare: true }) as never,
    );

    await expect(
      useCase.execute({
        pin: partyPin,
        playerIdentity: {
          kind: PartyPlayerKind.GUEST,
        },
        username: 'Morgan Guest',
      }),
    ).rejects.toThrow(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);

    expect(runtime.findPartyPlayer).not.toHaveBeenCalled();
    expect(runtime.ensureGuestPlayer).not.toHaveBeenCalled();
    expect(broadcastPartyObservationUseCase.execute).not.toHaveBeenCalled();
  });

  it('rejects authenticated joins when the user is active in another party', async () => {
    const runtime = createPlayerPartyRuntimeMock({
      findActivePartyByUserId: {
        partyId: otherPartyId,
        gameId,
        pin: activePartyPin,
        status: 'WAITING',
      },
    });
    const broadcastPartyObservationUseCase = {
      execute: vi.fn(),
    };
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
      createPasswordServiceMock({ compare: true }) as never,
    );

    await expect(
      useCase.execute({
        pin: partyPin,
        playerIdentity: {
          kind: PartyPlayerKind.USER,
          userId: playerUserId,
        },
        username: '',
      }),
    ).rejects.toThrow(GameErrorCode.PLAYER_ALREADY_IN_ACTIVE_PARTY);

    expect(runtime.ensureAuthenticatedPlayer).not.toHaveBeenCalled();
    expect(broadcastPartyObservationUseCase.execute).not.toHaveBeenCalled();
  });

  it('allows an authenticated player to rejoin the same active party', async () => {
    const player = {
      identity: { kind: PartyPlayerKind.USER, userId: playerUserId },
      username: 'Morgan',
      avatarUri: '/api/avatars/users/42?v=1',
      totalScore: 0,
      joinedAt: new Date('2026-04-27T10:00:00.000Z'),
    } satisfies PartyPlayer;
    const runtime = createPlayerPartyRuntimeMock({
      findActivePartyByUserId: {
        partyId,
        gameId,
        pin: partyPin,
        status: 'ACTIVE',
      },
      findPartyByPin: {
        partyId,
        gameId,
        hostUserId,
        privatePartyPasswordHash: null,
        settings: {
          allowOptionChangeAfterVoting: false,
          randomizeOptionOrder: false,
          randomizeStageOrder: false,
        },
        pin: partyPin,
        status: 'ACTIVE',
      },
      findPartyPlayer: player,
    });
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
      createPasswordServiceMock({ compare: true }) as never,
    );

    const result = await useCase.execute({
      pin: partyPin,
      playerIdentity: {
        kind: PartyPlayerKind.USER,
        userId: playerUserId,
      },
      username: '',
    });

    expect(runtime.ensureAuthenticatedPlayer).toHaveBeenCalledWith({
      partyId,
      userId: playerUserId,
    });
    expect(result.player).toEqual(player);
  });

  it('joins an authenticated player into the requested party and resolves the published player', async () => {
    const player = {
      identity: { kind: PartyPlayerKind.USER, userId: playerUserId },
      username: 'Morgan',
      avatarUri: '/api/avatars/users/42?v=1',
      totalScore: 0,
      joinedAt: new Date('2026-04-27T10:00:00.000Z'),
    } satisfies PartyPlayer;
    const runtime = createPlayerPartyRuntimeMock({
      findActivePartyByUserId: {
        partyId,
        gameId,
        pin: partyPin,
        status: 'WAITING',
      },
      findPartyPlayer: player,
    });
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
      createPasswordServiceMock({ compare: true }) as never,
    );

    const result = await useCase.execute({
      pin: partyPin,
      playerIdentity: {
        kind: PartyPlayerKind.USER,
        userId: playerUserId,
      },
      username: '',
    });

    expect(runtime.ensureAuthenticatedPlayer).toHaveBeenCalledWith({
      partyId,
      userId: playerUserId,
    });
    expect(runtime.findPartyPlayer).toHaveBeenCalledWith({
      partyId,
      playerIdentity: {
        kind: PartyPlayerKind.USER,
        userId: playerUserId,
      },
    });
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({
      partyId,
    });
    expect(result).toEqual({
      partyId,
      gameId,
      pin: partyPin,
      player,
    });
  });

  it('normalizes guest usernames and resolves a rejoined guest player by guest id', async () => {
    const player = {
      identity: { kind: PartyPlayerKind.GUEST, guestId },
      username: 'Morgan Guest',
      avatarUri: '/api/avatars/guests/guest-42',
      totalScore: 0,
      joinedAt: new Date('2026-04-27T10:00:00.000Z'),
    } satisfies PartyPlayer;
    const runtime = createPlayerPartyRuntimeMock({
      findPartyPlayer: player,
    });
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
      createPasswordServiceMock({ compare: true }) as never,
    );

    const result = await useCase.execute({
      avatarSeed: 'neon-seed',
      pin: partyPin,
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
        guestId,
      },
      username: '  Morgan Guest  ',
    });

    expect(runtime.ensureGuestPlayer).toHaveBeenCalledWith({
      avatarSeed: 'neon-seed',
      partyId,
      guestId,
      username: 'Morgan Guest',
    });
    expect(runtime.findPartyPlayer).toHaveBeenCalledWith({
      partyId,
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
        guestId,
      },
    });
    expect(result.player).toEqual(player);
  });

  it('allows guest rejoin by guest id when the browser no longer has the username', async () => {
    const player = {
      identity: { kind: PartyPlayerKind.GUEST, guestId },
      username: 'Morgan Guest',
      avatarUri: '/api/avatars/guests/guest-42',
      totalScore: 0,
      joinedAt: new Date('2026-04-27T10:00:00.000Z'),
    } satisfies PartyPlayer;
    const runtime = createPlayerPartyRuntimeMock({
      findPartyPlayer: player,
    });
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
      createPasswordServiceMock({ compare: true }) as never,
    );

    const result = await useCase.execute({
      avatarSeed: '  aurora-seed  ',
      pin: partyPin,
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
        guestId,
      },
      username: '   ',
    });

    expect(runtime.ensureGuestPlayer).toHaveBeenCalledWith({
      avatarSeed: 'aurora-seed',
      partyId,
      guestId,
      username: '',
    });
    expect(runtime.findPartyPlayer).toHaveBeenCalledWith({
      partyId,
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
        guestId,
      },
    });
    expect(result.player).toEqual(player);
  });

  it('rejects guest rejoin by guest id when the player is no longer in the party', async () => {
    const runtime = createPlayerPartyRuntimeMock({
      findPartyPlayer: null,
    });
    const broadcastPartyObservationUseCase = {
      execute: vi.fn(),
    };
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
      createPasswordServiceMock({ compare: true }) as never,
    );

    await expect(
      useCase.execute({
        pin: partyPin,
        playerIdentity: {
          kind: PartyPlayerKind.GUEST,
          guestId,
        },
        username: '   ',
      }),
    ).rejects.toThrow(GameErrorCode.VALIDATION_FAILED);

    expect(runtime.ensureGuestPlayer).not.toHaveBeenCalled();
    expect(broadcastPartyObservationUseCase.execute).not.toHaveBeenCalled();
  });

  it('rejects guest joins with an empty username', async () => {
    const runtime = createPlayerPartyRuntimeMock();
    const broadcastPartyObservationUseCase = {
      execute: vi.fn(),
    };
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
      createPasswordServiceMock({ compare: true }) as never,
    );

    await expect(
      useCase.execute({
        pin: partyPin,
        playerIdentity: {
          kind: PartyPlayerKind.GUEST,
        },
        username: '   ',
      }),
    ).rejects.toThrow(GameErrorCode.VALIDATION_FAILED);

    expect(runtime.ensureGuestPlayer).not.toHaveBeenCalled();
  });

  it('rejects private-party joins with missing password', async () => {
    const runtime = createPlayerPartyRuntimeMock({
      findPartyByPin: {
        partyId,
        gameId,
        hostUserId,
        privatePartyPasswordHash: 'hashed-private-password',
        pin: partyPin,
        settings: {
          allowOptionChangeAfterVoting: false,
          randomizeOptionOrder: false,
          randomizeStageOrder: false,
        },
        status: 'WAITING',
      },
    });
    const broadcastPartyObservationUseCase = {
      execute: vi.fn(),
    };
    const passwordService = createPasswordServiceMock({ compare: true });
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
      passwordService,
    );

    await expect(
      useCase.execute({
        pin: partyPin,
        playerIdentity: {
          kind: PartyPlayerKind.GUEST,
        },
        username: 'Morgan Guest',
      }),
    ).rejects.toThrow(GameErrorCode.VALIDATION_FAILED);

    expect(passwordService.compare).not.toHaveBeenCalled();
  });

  it('rejects private-party joins with invalid password', async () => {
    const runtime = createPlayerPartyRuntimeMock({
      findPartyByPin: {
        partyId,
        gameId,
        hostUserId,
        privatePartyPasswordHash: 'hashed-private-password',
        pin: partyPin,
        settings: {
          allowOptionChangeAfterVoting: false,
          randomizeOptionOrder: false,
          randomizeStageOrder: false,
        },
        status: 'WAITING',
      },
    });
    const broadcastPartyObservationUseCase = {
      execute: vi.fn(),
    };
    const passwordService = createPasswordServiceMock({ compare: false });
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
      passwordService,
    );

    await expect(
      useCase.execute({
        partyPassword: 'wrong-secret',
        pin: partyPin,
        playerIdentity: {
          kind: PartyPlayerKind.GUEST,
        },
        username: 'Morgan Guest',
      }),
    ).rejects.toThrow(GameErrorCode.VALIDATION_FAILED);

    expect(passwordService.compare).toHaveBeenCalledWith('wrong-secret', 'hashed-private-password');
  });
});
