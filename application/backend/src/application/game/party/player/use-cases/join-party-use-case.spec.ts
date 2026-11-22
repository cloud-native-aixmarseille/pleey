import 'reflect-metadata';
import { PartyPlayerKind } from '@pleey/contracts/party';
import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import {
  InvalidPartyPasswordError,
  MissingPartyPasswordError,
} from '../../../../../domain/game/party/errors/join-party.error';
import type { PartyPlayer } from '../../../../../domain/game/party/player/entities/party-player';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { createPasswordServiceMock } from '../../../../../test-utils/mock-factories/password-service.mock-factory';
import {
  createPlayerPartyRuntimeMock,
  DEFAULT_PARTY_JOIN_TARGET,
} from '../../../../../test-utils/mock-factories/player-party-runtime.mock-factory';
import { JoinPartyUseCase } from './join-party-use-case';

const partyPin = backendTestIdentifiers.partyPin('123456');
const partyId = backendTestIdentifiers.party(12);
const playerUserId = backendTestIdentifiers.user(42);

function createPlayer(): PartyPlayer {
  return {
    identity: { kind: PartyPlayerKind.USER, userId: playerUserId },
    username: 'Morgan',
    avatarUri: '/api/avatars/users/42?v=1',
    totalScore: 0,
    joinedAt: new Date('2026-04-27T10:00:00.000Z'),
  };
}

describe('JoinPartyUseCase', () => {
  it('rejects a new authenticated join after the party starts when late join is disabled', async () => {
    // Arrange
    const runtime = createPlayerPartyRuntimeMock({
      findActivePartyByUserId: null,
      findPartyByPin: { status: 'ACTIVE' },
      findPartyPlayer: null,
    });
    const useCase = new JoinPartyUseCase(
      runtime as never,
      { execute: vi.fn() } as never,
      createPasswordServiceMock({ compare: true }) as never,
    );

    // Act + Assert
    await expect(
      useCase.execute({
        pin: partyPin,
        playerIdentity: { kind: PartyPlayerKind.USER, userId: playerUserId },
        username: '',
      }),
    ).rejects.toThrow(GameErrorCode.PARTY_COMMAND_NOT_AVAILABLE);
    expect(runtime.ensureAuthenticatedPlayer).not.toHaveBeenCalled();
  });

  it('rejects an identity that already has a different active player party', async () => {
    // Arrange
    const runtime = createPlayerPartyRuntimeMock({
      findActivePartyByUserId: { partyId: backendTestIdentifiers.party(99) },
      findPartyByPin: { partyId },
      findPartyPlayer: null,
    });
    const useCase = new JoinPartyUseCase(
      runtime as never,
      { execute: vi.fn() } as never,
      createPasswordServiceMock({ compare: true }) as never,
    );

    // Act + Assert
    await expect(
      useCase.execute({
        pin: partyPin,
        playerIdentity: { kind: PartyPlayerKind.USER, userId: playerUserId },
        username: '',
      }),
    ).rejects.toThrow(GameErrorCode.PLAYER_ALREADY_IN_ACTIVE_PARTY);
    expect(runtime.ensureAuthenticatedPlayer).not.toHaveBeenCalled();
  });

  it('joins and publishes an authenticated participant', async () => {
    // Arrange
    const player = createPlayer();
    const runtime = createPlayerPartyRuntimeMock({
      findActivePartyByUserId: null,
      findPartyPlayer: player,
    });
    const broadcast = { execute: vi.fn().mockResolvedValue(undefined) };
    const useCase = new JoinPartyUseCase(
      runtime as never,
      broadcast as never,
      createPasswordServiceMock({ compare: true }) as never,
    );

    // Act
    const result = await useCase.execute({
      pin: partyPin,
      playerIdentity: { kind: PartyPlayerKind.USER, userId: playerUserId },
      username: '',
    });

    // Assert
    expect(runtime.ensureAuthenticatedPlayer).toHaveBeenCalledWith({ partyId, userId: playerUserId });
    expect(result).toMatchObject({ gameId: DEFAULT_PARTY_JOIN_TARGET.gameId, partyId, pin: partyPin, player });
    expect(broadcast.execute).toHaveBeenCalledWith({ partyId });
  });

  it('rejoins the same active party through durable membership without a password', async () => {
    // Arrange
    const player = createPlayer();
    const passwordService = createPasswordServiceMock({ compare: false });
    const runtime = createPlayerPartyRuntimeMock({
      findActivePartyByUserId: { partyId },
      findPartyByPin: {
        privatePartyPasswordHash: 'private-password-hash',
        status: 'ACTIVE',
      },
      findPartyPlayer: player,
    });
    const useCase = new JoinPartyUseCase(runtime as never, { execute: vi.fn() } as never, passwordService);

    // Act
    const result = await useCase.execute({
      pin: partyPin,
      playerIdentity: { kind: PartyPlayerKind.USER, userId: playerUserId },
      username: '',
    });

    // Assert
    expect(result.player).toEqual(player);
    expect(passwordService.compare).not.toHaveBeenCalled();
  });

  it('requires and verifies the private party password for a new membership', async () => {
    // Arrange
    const missingRuntime = createPlayerPartyRuntimeMock({
      findActivePartyByUserId: null,
      findPartyByPin: { privatePartyPasswordHash: 'private-password-hash' },
      findPartyPlayer: null,
    });
    const invalidRuntime = createPlayerPartyRuntimeMock({
      findActivePartyByUserId: null,
      findPartyByPin: { privatePartyPasswordHash: 'private-password-hash' },
      findPartyPlayer: null,
    });
    const passwordService = createPasswordServiceMock({ compare: false });
    const missingUseCase = new JoinPartyUseCase(
      missingRuntime as never,
      { execute: vi.fn() } as never,
      passwordService,
    );
    const invalidUseCase = new JoinPartyUseCase(
      invalidRuntime as never,
      { execute: vi.fn() } as never,
      passwordService,
    );
    const command = {
      pin: partyPin,
      playerIdentity: { kind: PartyPlayerKind.USER, userId: playerUserId } as const,
      username: '',
    };

    // Act + Assert
    await expect(missingUseCase.execute(command)).rejects.toBeInstanceOf(MissingPartyPasswordError);
    await expect(invalidUseCase.execute({ ...command, partyPassword: 'wrong-secret' })).rejects.toBeInstanceOf(
      InvalidPartyPasswordError,
    );
    expect(passwordService.compare).toHaveBeenCalledWith('wrong-secret', 'private-password-hash');
  });

  it('allows a new member to join an active party when late joining is enabled', async () => {
    // Arrange
    const player = createPlayer();
    const runtime = createPlayerPartyRuntimeMock({
      findActivePartyByUserId: null,
      findPartyByPin: {
        status: 'ACTIVE',
        settings: { ...DEFAULT_PARTY_JOIN_TARGET.settings, allowJoiningAfterStart: true },
      },
      findPartyPlayer: player,
    });
    const useCase = new JoinPartyUseCase(
      runtime as never,
      { execute: vi.fn() } as never,
      createPasswordServiceMock({ compare: true }) as never,
    );

    // Act
    const result = await useCase.execute({
      pin: partyPin,
      playerIdentity: { kind: PartyPlayerKind.USER, userId: playerUserId },
      username: '',
    });

    // Assert
    expect(result.player).toEqual(player);
  });
});
