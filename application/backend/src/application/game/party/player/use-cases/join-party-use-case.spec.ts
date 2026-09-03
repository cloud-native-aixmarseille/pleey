import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import {
  GuestPlayerRejoinNotFoundError,
  GuestUsernameRequiredError,
  InvalidPartyPasswordError,
  MissingPartyPasswordError,
} from '../../../../../domain/game/party/errors/join-party.error';
import type { PartyPlayer } from '../../../../../domain/game/party/player/entities/party-player';
import { DEFAULT_PARTY_SETTINGS } from '../../../../../domain/game/party/shared/entities/party-settings';
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
    // Arrange
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
        settings: DEFAULT_PARTY_SETTINGS,
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

    // Act + Assert
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
    // Arrange
    const runtime = createPlayerPartyRuntimeMock({
      findPartyByPin: {
        partyId,
        gameId,
        hostUserId,
        privatePartyPasswordHash: null,
        settings: DEFAULT_PARTY_SETTINGS,
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

    // Act + Assert
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
    // Arrange
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

    // Act + Assert
    await expect(
      useCase.execute({
        pin: partyPin,
        playerIdentity: {
          kind: PartyPlayerKind.USER,
          userId: playerUserId,
        },
        username: '',
      }),
    ).rejects.toMatchObject({
      code: GameErrorCode.PLAYER_ALREADY_IN_ACTIVE_PARTY,
      context: {
        activePartyId: otherPartyId,
        requestedPartyId: partyId,
        userId: playerUserId,
      },
    });

    expect(runtime.ensureAuthenticatedPlayer).not.toHaveBeenCalled();
    expect(broadcastPartyObservationUseCase.execute).not.toHaveBeenCalled();
  });

  it('allows an authenticated player to rejoin the same active party', async () => {
    // Arrange
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
        settings: DEFAULT_PARTY_SETTINGS,
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

    // Act
    const result = await useCase.execute({
      pin: partyPin,
      playerIdentity: {
        kind: PartyPlayerKind.USER,
        userId: playerUserId,
      },
      username: '',
    });

    // Assert
    expect(runtime.ensureAuthenticatedPlayer).toHaveBeenCalledWith({
      partyId,
      userId: playerUserId,
    });
    expect(result.player).toEqual(player);
  });

  it('joins an authenticated player into the requested party and resolves the published player', async () => {
    // Arrange
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

    // Act
    const result = await useCase.execute({
      pin: partyPin,
      playerIdentity: {
        kind: PartyPlayerKind.USER,
        userId: playerUserId,
      },
      username: '',
    });

    // Assert
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
    // Arrange
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

    // Act
    const result = await useCase.execute({
      avatarSeed: 'neon-seed',
      pin: partyPin,
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
        guestId,
      },
      username: '  Morgan Guest  ',
    });

    // Assert
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
    // Arrange
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

    // Act
    const result = await useCase.execute({
      avatarSeed: '  aurora-seed  ',
      pin: partyPin,
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
        guestId,
      },
      username: '   ',
    });

    // Assert
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
    // Arrange
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

    // Act + Assert
    await expect(
      useCase.execute({
        pin: partyPin,
        playerIdentity: {
          kind: PartyPlayerKind.GUEST,
          guestId,
        },
        username: '   ',
      }),
    ).rejects.toBeInstanceOf(GuestPlayerRejoinNotFoundError);

    expect(runtime.ensureGuestPlayer).not.toHaveBeenCalled();
    expect(broadcastPartyObservationUseCase.execute).not.toHaveBeenCalled();
  });

  it('rejects guest joins with an empty username', async () => {
    // Arrange
    const runtime = createPlayerPartyRuntimeMock();
    const broadcastPartyObservationUseCase = {
      execute: vi.fn(),
    };
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
      createPasswordServiceMock({ compare: true }) as never,
    );

    // Act + Assert
    await expect(
      useCase.execute({
        pin: partyPin,
        playerIdentity: {
          kind: PartyPlayerKind.GUEST,
        },
        username: '   ',
      }),
    ).rejects.toBeInstanceOf(GuestUsernameRequiredError);

    expect(runtime.ensureGuestPlayer).not.toHaveBeenCalled();
  });

  it('rejects private-party joins with missing password', async () => {
    // Arrange
    const runtime = createPlayerPartyRuntimeMock({
      findPartyByPin: {
        partyId,
        gameId,
        hostUserId,
        privatePartyPasswordHash: 'hashed-private-password',
        pin: partyPin,
        settings: DEFAULT_PARTY_SETTINGS,
        status: 'WAITING',
      },
    });
    const broadcastPartyObservationUseCase = {
      execute: vi.fn(),
    };
    const passwordService = createPasswordServiceMock({ compare: true });
    const useCase = new JoinPartyUseCase(runtime as never, broadcastPartyObservationUseCase as never, passwordService);

    // Act + Assert
    await expect(
      useCase.execute({
        pin: partyPin,
        playerIdentity: {
          kind: PartyPlayerKind.GUEST,
        },
        username: 'Morgan Guest',
      }),
    ).rejects.toBeInstanceOf(MissingPartyPasswordError);

    expect(passwordService.compare).not.toHaveBeenCalled();
  });

  it('rejects private-party joins with invalid password', async () => {
    // Arrange
    const runtime = createPlayerPartyRuntimeMock({
      findPartyByPin: {
        partyId,
        gameId,
        hostUserId,
        privatePartyPasswordHash: 'hashed-private-password',
        pin: partyPin,
        settings: DEFAULT_PARTY_SETTINGS,
        status: 'WAITING',
      },
    });
    const broadcastPartyObservationUseCase = {
      execute: vi.fn(),
    };
    const passwordService = createPasswordServiceMock({ compare: false });
    const useCase = new JoinPartyUseCase(runtime as never, broadcastPartyObservationUseCase as never, passwordService);

    // Act + Assert
    await expect(
      useCase.execute({
        partyPassword: 'wrong-secret',
        pin: partyPin,
        playerIdentity: {
          kind: PartyPlayerKind.GUEST,
        },
        username: 'Morgan Guest',
      }),
    ).rejects.toBeInstanceOf(InvalidPartyPasswordError);

    expect(passwordService.compare).toHaveBeenCalledWith('wrong-secret', 'hashed-private-password');
  });

  it('allows a new authenticated player to join a started party when allowJoiningAfterStart is enabled', async () => {
    // Arrange
    const player = {
      identity: { kind: PartyPlayerKind.USER, userId: playerUserId },
      username: 'Morgan',
      avatarUri: '/api/avatars/users/42?v=1',
      totalScore: 0,
      joinedAt: new Date('2026-04-27T10:00:00.000Z'),
    } satisfies PartyPlayer;
    const runtime = createPlayerPartyRuntimeMock({
      findActivePartyByUserId: null,
      findPartyByPin: {
        partyId,
        gameId,
        hostUserId,
        privatePartyPasswordHash: null,
        settings: { ...DEFAULT_PARTY_SETTINGS, allowJoiningAfterStart: true },
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

    // Act
    const result = await useCase.execute({
      pin: partyPin,
      playerIdentity: {
        kind: PartyPlayerKind.USER,
        userId: playerUserId,
      },
      username: '',
    });

    // Assert
    expect(runtime.ensureAuthenticatedPlayer).toHaveBeenCalledWith({
      partyId,
      userId: playerUserId,
    });
    expect(result.player).toEqual(player);
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({ partyId });
  });

  it('allows a new guest player to join a started party when allowJoiningAfterStart is enabled', async () => {
    // Arrange
    const player = {
      identity: { kind: PartyPlayerKind.GUEST, guestId },
      username: 'Morgan Guest',
      avatarUri: '/api/avatars/guests/guest-42',
      totalScore: 0,
      joinedAt: new Date('2026-04-27T10:00:00.000Z'),
    } satisfies PartyPlayer;
    const runtime = createPlayerPartyRuntimeMock({
      findPartyByPin: {
        partyId,
        gameId,
        hostUserId,
        privatePartyPasswordHash: null,
        settings: { ...DEFAULT_PARTY_SETTINGS, allowJoiningAfterStart: true },
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

    // Act
    const result = await useCase.execute({
      pin: partyPin,
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
      },
      username: 'Morgan Guest',
    });

    // Assert
    expect(runtime.ensureGuestPlayer).toHaveBeenCalledWith({
      partyId,
      guestId: null,
      username: 'Morgan Guest',
    });
    expect(result.player).toEqual(player);
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({ partyId });
  });
});
