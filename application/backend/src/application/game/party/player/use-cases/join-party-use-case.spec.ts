import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { PartyPinIdentifier } from '../../../../../application/game/party/shared/services/identifiers/party-pin-identifier';
import { GuestIdentifier } from '../../../../../application/identity/shared/services/identifiers/guest-identifier';
import { UserIdentifier } from '../../../../../application/identity/shared/services/identifiers/user-identifier';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { PartyPlayerKind } from '../../../../../domain/game/party/enums/party-player-kind.enum';
import { createPlayerPartyRuntimeMock } from '../../../../../test-utils/mock-factories/player-party-runtime.mock-factory';
import { JoinPartyUseCase } from './join-party-use-case';

const partyPinIdentifier = new PartyPinIdentifier();
const guestIdentifier = new GuestIdentifier();
const userIdentifier = new UserIdentifier();

describe('JoinPartyUseCase', () => {
  it('rejects authenticated joins when the user is active in another party', async () => {
    const runtime = createPlayerPartyRuntimeMock({
      findActivePartyByUserId: {
        partyId: 99,
        gameId: 21,
        pin: '654321',
        status: 'WAITING',
      },
    });
    const broadcastPartyObservationUseCase = {
      execute: vi.fn(),
    };
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
    );

    await expect(
      useCase.execute({
        pin: partyPinIdentifier.parse('123456'),
        playerIdentity: {
          kind: PartyPlayerKind.USER,
          userId: userIdentifier.parse(42),
        },
        username: '',
      }),
    ).rejects.toThrow(GameErrorCode.PLAYER_ALREADY_IN_ACTIVE_PARTY);

    expect(runtime.ensureAuthenticatedPlayer).not.toHaveBeenCalled();
    expect(broadcastPartyObservationUseCase.execute).not.toHaveBeenCalled();
  });

  it('joins an authenticated player into the requested party and resolves the published player', async () => {
    const player = {
      identity: { kind: PartyPlayerKind.USER, userId: userIdentifier.parse(42) },
      username: 'Morgan',
      avatarUri: '/api/avatars/users/42?v=1',
      totalScore: 0,
      joinedAt: new Date('2026-04-27T10:00:00.000Z'),
    };
    const runtime = createPlayerPartyRuntimeMock({
      findActivePartyByUserId: {
        partyId: 12,
        gameId: 21,
        pin: '123456',
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
    );

    const result = await useCase.execute({
      pin: partyPinIdentifier.parse('123456'),
      playerIdentity: {
        kind: PartyPlayerKind.USER,
        userId: userIdentifier.parse(42),
      },
      username: '',
    });

    expect(runtime.ensureAuthenticatedPlayer).toHaveBeenCalledWith({
      partyId: 12,
      userId: 42,
    });
    expect(runtime.findPartyPlayer).toHaveBeenCalledWith({
      partyId: 12,
      playerIdentity: {
        kind: PartyPlayerKind.USER,
        userId: 42,
      },
    });
    expect(broadcastPartyObservationUseCase.execute).toHaveBeenCalledWith({
      partyId: 12,
    });
    expect(result).toEqual({
      partyId: 12,
      gameId: 21,
      pin: '123456',
      player,
    });
  });

  it('normalizes guest usernames and resolves a rejoined guest player by guest id', async () => {
    const player = {
      identity: { kind: PartyPlayerKind.GUEST, guestId: guestIdentifier.parse('guest-42') },
      username: 'Morgan Guest',
      avatarUri: '/api/avatars/guests/guest-42',
      totalScore: 0,
      joinedAt: new Date('2026-04-27T10:00:00.000Z'),
    };
    const runtime = createPlayerPartyRuntimeMock({
      findPartyPlayer: player,
    });
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
    );

    const result = await useCase.execute({
      pin: partyPinIdentifier.parse('123456'),
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
        guestId: guestIdentifier.parse('guest-42'),
      },
      username: '  Morgan Guest  ',
    });

    expect(runtime.ensureGuestPlayer).toHaveBeenCalledWith({
      partyId: 12,
      guestId: 'guest-42',
      username: 'Morgan Guest',
    });
    expect(runtime.findPartyPlayer).toHaveBeenCalledWith({
      partyId: 12,
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
        guestId: 'guest-42',
      },
    });
    expect(result.player).toEqual(player);
  });

  it('allows guest rejoin by guest id when the browser no longer has the username', async () => {
    const player = {
      identity: { kind: PartyPlayerKind.GUEST, guestId: guestIdentifier.parse('guest-42') },
      username: 'Morgan Guest',
      avatarUri: '/api/avatars/guests/guest-42',
      totalScore: 0,
      joinedAt: new Date('2026-04-27T10:00:00.000Z'),
    };
    const runtime = createPlayerPartyRuntimeMock({
      findPartyPlayer: player,
    });
    const broadcastPartyObservationUseCase = {
      execute: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
    );

    const result = await useCase.execute({
      pin: partyPinIdentifier.parse('123456'),
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
        guestId: guestIdentifier.parse('guest-42'),
      },
      username: '   ',
    });

    expect(runtime.ensureGuestPlayer).toHaveBeenCalledWith({
      partyId: 12,
      guestId: 'guest-42',
      username: '',
    });
    expect(runtime.findPartyPlayer).toHaveBeenCalledWith({
      partyId: 12,
      playerIdentity: {
        kind: PartyPlayerKind.GUEST,
        guestId: 'guest-42',
      },
    });
    expect(result.player).toEqual(player);
  });

  it('rejects guest joins with an empty username', async () => {
    const runtime = createPlayerPartyRuntimeMock();
    const broadcastPartyObservationUseCase = {
      execute: vi.fn(),
    };
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcastPartyObservationUseCase as never,
    );

    await expect(
      useCase.execute({
        pin: partyPinIdentifier.parse('123456'),
        playerIdentity: {
          kind: PartyPlayerKind.GUEST,
        },
        username: '   ',
      }),
    ).rejects.toThrow(GameErrorCode.VALIDATION_FAILED);

    expect(runtime.ensureGuestPlayer).not.toHaveBeenCalled();
  });
});
