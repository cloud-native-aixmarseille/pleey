import 'reflect-metadata';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { PinAlreadyInUseError } from '../../../../../domain/game/party/errors/pin-already-in-use.error';
import { OrganizationErrorCode } from '../../../../../domain/organization/enums/organization-error-code.enum';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { createOrganizationMemberRepositoryMock } from '../../../../../test-utils/mock-factories/organization.mock-factory';
import { createPasswordServiceMock } from '../../../../../test-utils/mock-factories/password-service.mock-factory';
import { GamePermissionResolver } from '../../../management/services/game-permission-resolver';
import { PartyPinIdentifier } from '../../shared/services/identifiers/party-pin-identifier';
import { CreatePartyUseCase } from './create-party-use-case';

const partyPinIdentifier = new PartyPinIdentifier();

describe('CreatePartyUseCase', () => {
  const broadcastPartyObservationUseCase = {
    broadcastIfPresent: vi.fn().mockResolvedValue(undefined),
  };

  const partyManagement = {
    findManagedGame: vi.fn(),
    findActivePartyByGameId: vi.fn(),
    findActivePartiesByHostId: vi.fn(),
    createParty: vi.fn(),
  };

  const memberRepository = createOrganizationMemberRepositoryMock();
  const passwordService = createPasswordServiceMock();
  const gamePermissionResolver = {
    assertCanCreateParty: vi.fn().mockResolvedValue(undefined),
    resolveGamePermissions: vi.fn(),
  };

  let useCase: CreatePartyUseCase;

  beforeEach(() => {
    partyManagement.findManagedGame.mockReset();
    partyManagement.findActivePartyByGameId.mockReset();
    partyManagement.findActivePartiesByHostId.mockReset();
    partyManagement.createParty.mockReset();
    gamePermissionResolver.assertCanCreateParty.mockReset();
    gamePermissionResolver.assertCanCreateParty.mockResolvedValue(undefined);
    broadcastPartyObservationUseCase.broadcastIfPresent.mockReset();
    broadcastPartyObservationUseCase.broadcastIfPresent.mockResolvedValue(undefined);
    passwordService.hash.mockReset();
    passwordService.hash.mockResolvedValue('hashed-private-party-password');
    passwordService.isValidPassword.mockReset();
    passwordService.isValidPassword.mockReturnValue(true);

    memberRepository.findByOrganizationAndUser.mockReset();

    partyManagement.findManagedGame.mockResolvedValue({
      gameId: backendTestIdentifiers.game(17),
      type: 'quiz',
      projectId: backendTestIdentifiers.project(6),
      organizationId: backendTestIdentifiers.organization(3),
    });
    partyManagement.findActivePartyByGameId.mockResolvedValue(null);
    partyManagement.findActivePartiesByHostId.mockResolvedValue([]);
    partyManagement.createParty.mockResolvedValue({
      partyId: backendTestIdentifiers.party(21),
      gameId: backendTestIdentifiers.game(17),
      pin: '123456',
      status: 'WAITING',
      role: 'HOST',
      createdAt: new Date('2026-04-13T12:00:00.000Z'),
    });
    memberRepository.findByOrganizationAndUser.mockResolvedValue({ id: 8 } as never);

    useCase = new CreatePartyUseCase(
      partyManagement as never,
      memberRepository,
      gamePermissionResolver as unknown as GamePermissionResolver,
      broadcastPartyObservationUseCase as never,
      partyPinIdentifier,
      passwordService,
    );
  });

  it('creates a host-owned party for an authorized member', async () => {
    const result = await useCase.execute({
      gameId: backendTestIdentifiers.game(17),
      hostUserId: backendTestIdentifiers.user(42),
    });

    expect(memberRepository.findByOrganizationAndUser).toHaveBeenCalledWith(
      backendTestIdentifiers.organization(3),
      backendTestIdentifiers.user(42),
    );
    expect(gamePermissionResolver.assertCanCreateParty).toHaveBeenCalledWith({
      gameId: backendTestIdentifiers.game(17),
      hostUserId: backendTestIdentifiers.user(42),
    });
    expect(partyManagement.createParty).toHaveBeenCalledWith(
      expect.objectContaining({
        gameId: backendTestIdentifiers.game(17),
        hostUserId: backendTestIdentifiers.user(42),
      }),
    );
    expect(broadcastPartyObservationUseCase.broadcastIfPresent).toHaveBeenCalledWith({
      partyId: backendTestIdentifiers.party(21),
    });
    expect(result).toEqual({
      partyId: backendTestIdentifiers.party(21),
      gameId: backendTestIdentifiers.game(17),
      pin: '123456',
      status: 'WAITING',
      role: 'HOST',
      createdAt: new Date('2026-04-13T12:00:00.000Z'),
    });
  });

  it('rejects missing games before creating a party', async () => {
    partyManagement.findManagedGame.mockResolvedValue(null);

    await expect(
      useCase.execute({
        gameId: backendTestIdentifiers.game(17),
        hostUserId: backendTestIdentifiers.user(42),
      }),
    ).rejects.toThrow(GameErrorCode.GAME_NOT_FOUND);
  });

  it('rejects hosts that are not members of the owning organization', async () => {
    memberRepository.findByOrganizationAndUser.mockResolvedValue(null);

    await expect(
      useCase.execute({
        gameId: backendTestIdentifiers.game(17),
        hostUserId: backendTestIdentifiers.user(42),
      }),
    ).rejects.toThrow(OrganizationErrorCode.NOT_A_MEMBER);
  });

  it('rejects when another host already owns an active party for the game', async () => {
    gamePermissionResolver.assertCanCreateParty.mockRejectedValue(
      new Error(GameErrorCode.GAME_ALREADY_HAS_ACTIVE_PARTY),
    );

    await expect(
      useCase.execute({
        gameId: backendTestIdentifiers.game(17),
        hostUserId: backendTestIdentifiers.user(42),
      }),
    ).rejects.toThrow(GameErrorCode.GAME_ALREADY_HAS_ACTIVE_PARTY);
  });

  it('rejects when the same host already owns an active party for the game', async () => {
    gamePermissionResolver.assertCanCreateParty.mockRejectedValue(
      new Error(GameErrorCode.HOST_ALREADY_HAS_ACTIVE_PARTY_FOR_GAME),
    );

    await expect(
      useCase.execute({
        gameId: backendTestIdentifiers.game(17),
        hostUserId: backendTestIdentifiers.user(42),
      }),
    ).rejects.toThrow(GameErrorCode.HOST_ALREADY_HAS_ACTIVE_PARTY_FOR_GAME);
  });

  it('rejects when the host already owns another active party', async () => {
    gamePermissionResolver.assertCanCreateParty.mockRejectedValue(
      new Error(GameErrorCode.ACTIVE_PARTY_EXISTS),
    );

    await expect(
      useCase.execute({
        gameId: backendTestIdentifiers.game(17),
        hostUserId: backendTestIdentifiers.user(42),
      }),
    ).rejects.toThrow(GameErrorCode.ACTIVE_PARTY_EXISTS);
  });

  it('rejects when the game has no configured stages', async () => {
    gamePermissionResolver.assertCanCreateParty.mockRejectedValue(
      new Error(GameErrorCode.PARTY_STAGES_NOT_AVAILABLE),
    );

    await expect(
      useCase.execute({
        gameId: backendTestIdentifiers.game(17),
        hostUserId: backendTestIdentifiers.user(42),
      }),
    ).rejects.toThrow(GameErrorCode.PARTY_STAGES_NOT_AVAILABLE);
  });

  it('retries pin generation when a generated pin is already in use', async () => {
    partyManagement.createParty
      .mockRejectedValueOnce(new PinAlreadyInUseError())
      .mockResolvedValueOnce({
        partyId: backendTestIdentifiers.party(88),
        gameId: backendTestIdentifiers.game(17),
        pin: '654321',
        status: 'WAITING',
        role: 'HOST',
        createdAt: new Date('2026-04-13T12:30:00.000Z'),
      });

    const result = await useCase.execute({
      gameId: backendTestIdentifiers.game(17),
      hostUserId: backendTestIdentifiers.user(42),
    });

    expect(partyManagement.createParty).toHaveBeenCalledTimes(2);
    expect(result.pin).toBe('654321');
  });

  it('hashes private party passwords before persisting a party', async () => {
    await useCase.execute({
      gameId: backendTestIdentifiers.game(17),
      hostUserId: backendTestIdentifiers.user(42),
      privatePartyPassword: 'secret42',
    });

    expect(passwordService.hash).toHaveBeenCalledWith('secret42');
    expect(partyManagement.createParty).toHaveBeenCalledWith(
      expect.objectContaining({
        privatePartyPasswordHash: 'hashed-private-party-password',
      }),
    );
  });

  it('rejects invalid private party passwords', async () => {
    passwordService.isValidPassword.mockReturnValue(false);

    await expect(
      useCase.execute({
        gameId: backendTestIdentifiers.game(17),
        hostUserId: backendTestIdentifiers.user(42),
        privatePartyPassword: '123',
      }),
    ).rejects.toThrow(GameErrorCode.VALIDATION_FAILED);

    expect(passwordService.hash).not.toHaveBeenCalled();
    expect(partyManagement.createParty).not.toHaveBeenCalled();
  });
});
