import 'reflect-metadata';
import { describe, expect, it, vi } from 'vitest';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { PinAlreadyInUseError } from '../../../../../domain/game/party/errors/pin-already-in-use.error';
import { PartySettingsResolver } from '../../../../../domain/game/party/shared/services/party-settings-resolver';
import { OrganizationErrorCode } from '../../../../../domain/organization/enums/organization-error-code.enum';
import { backendTestIdentifiers } from '../../../../../test-utils/branded-identifiers';
import { createOrganizationMemberRepositoryMock } from '../../../../../test-utils/mock-factories/organization.mock-factory';
import { createPasswordServiceMock } from '../../../../../test-utils/mock-factories/password-service.mock-factory';
import { GamePermissionResolver } from '../../../management/services/game-permission-resolver';
import { PartyPinIdentifier } from '../../shared/services/identifiers/party-pin-identifier';
import { CreatePartyUseCase } from './create-party-use-case';

const partyPinIdentifier = new PartyPinIdentifier();
const defaultCommand = {
  gameId: backendTestIdentifiers.game(17),
  hostUserId: backendTestIdentifiers.user(42),
};

describe('CreatePartyUseCase', () => {
  function arrangeCreatePartyUseCase() {
    const broadcastPartyObservationUseCase = {
      broadcastIfPresent: vi.fn().mockResolvedValue(undefined),
    };
    const partyManagement = {
      findManagedGame: vi.fn().mockResolvedValue({
        gameId: backendTestIdentifiers.game(17),
        type: 'quiz',
        projectId: backendTestIdentifiers.project(6),
        organizationId: backendTestIdentifiers.organization(3),
      }),
      findActivePartyByGameId: vi.fn().mockResolvedValue(null),
      findActivePartiesByHostId: vi.fn().mockResolvedValue([]),
      createParty: vi.fn().mockResolvedValue({
        partyId: backendTestIdentifiers.party(21),
        gameId: backendTestIdentifiers.game(17),
        pin: '123456',
        status: 'WAITING',
        role: 'HOST',
        createdAt: new Date('2026-04-13T12:00:00.000Z'),
      }),
    };
    const memberRepository = createOrganizationMemberRepositoryMock({
      findByOrganizationAndUser: { id: 8 } as never,
    });
    const passwordService = createPasswordServiceMock({
      hash: 'hashed-private-party-password',
      isValidPassword: true,
    });
    const partySettingsResolver = new PartySettingsResolver();
    const gamePermissionResolver = {
      assertCanCreateParty: vi.fn().mockResolvedValue(undefined),
      resolveGamePermissions: vi.fn(),
    };
    const useCase = new CreatePartyUseCase(
      partyManagement as never,
      memberRepository,
      gamePermissionResolver as unknown as GamePermissionResolver,
      broadcastPartyObservationUseCase as never,
      partySettingsResolver,
      partyPinIdentifier,
      passwordService,
    );

    return {
      useCase,
      partyManagement,
      memberRepository,
      passwordService,
      gamePermissionResolver,
      broadcastPartyObservationUseCase,
    };
  }

  it('creates a host-owned party for an authorized member', async () => {
    // Arrange
    const { useCase, memberRepository, partyManagement, gamePermissionResolver, broadcastPartyObservationUseCase } =
      arrangeCreatePartyUseCase();

    // Act
    const result = await useCase.execute(defaultCommand);

    // Assert
    expect(memberRepository.findByOrganizationAndUser).toHaveBeenCalledWith(
      backendTestIdentifiers.organization(3),
      defaultCommand.hostUserId,
    );
    expect(gamePermissionResolver.assertCanCreateParty).toHaveBeenCalledWith({
      gameId: defaultCommand.gameId,
      hostUserId: defaultCommand.hostUserId,
    });
    expect(partyManagement.createParty).toHaveBeenCalledWith(
      expect.objectContaining({
        gameId: defaultCommand.gameId,
        hostUserId: defaultCommand.hostUserId,
        settings: {
          allowOptionChangeAfterVoting: false,
          randomizeOptionOrder: false,
          randomizeStageOrder: false,
        },
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
    // Arrange
    const { useCase, partyManagement } = arrangeCreatePartyUseCase();

    partyManagement.findManagedGame.mockResolvedValue(null);

    // Act + Assert
    await expect(useCase.execute(defaultCommand)).rejects.toThrow(GameErrorCode.GAME_NOT_FOUND);
  });

  it('rejects hosts that are not members of the owning organization', async () => {
    // Arrange
    const { useCase, memberRepository } = arrangeCreatePartyUseCase();

    memberRepository.findByOrganizationAndUser.mockResolvedValue(null);

    // Act + Assert
    await expect(useCase.execute(defaultCommand)).rejects.toThrow(OrganizationErrorCode.NOT_A_MEMBER);
  });

  it('rejects when another host already owns an active party for the game', async () => {
    // Arrange
    const { useCase, gamePermissionResolver } = arrangeCreatePartyUseCase();

    gamePermissionResolver.assertCanCreateParty.mockRejectedValue(
      new Error(GameErrorCode.GAME_ALREADY_HAS_ACTIVE_PARTY),
    );

    // Act + Assert
    await expect(useCase.execute(defaultCommand)).rejects.toThrow(GameErrorCode.GAME_ALREADY_HAS_ACTIVE_PARTY);
  });

  it('rejects when the same host already owns an active party for the game', async () => {
    // Arrange
    const { useCase, gamePermissionResolver } = arrangeCreatePartyUseCase();

    gamePermissionResolver.assertCanCreateParty.mockRejectedValue(
      new Error(GameErrorCode.HOST_ALREADY_HAS_ACTIVE_PARTY_FOR_GAME),
    );

    // Act + Assert
    await expect(useCase.execute(defaultCommand)).rejects.toThrow(GameErrorCode.HOST_ALREADY_HAS_ACTIVE_PARTY_FOR_GAME);
  });

  it('rejects when the host already owns another active party', async () => {
    // Arrange
    const { useCase, gamePermissionResolver } = arrangeCreatePartyUseCase();

    gamePermissionResolver.assertCanCreateParty.mockRejectedValue(new Error(GameErrorCode.ACTIVE_PARTY_EXISTS));

    // Act + Assert
    await expect(useCase.execute(defaultCommand)).rejects.toThrow(GameErrorCode.ACTIVE_PARTY_EXISTS);
  });

  it('rejects when the game has no configured stages', async () => {
    // Arrange
    const { useCase, gamePermissionResolver } = arrangeCreatePartyUseCase();

    gamePermissionResolver.assertCanCreateParty.mockRejectedValue(new Error(GameErrorCode.PARTY_STAGES_NOT_AVAILABLE));

    // Act + Assert
    await expect(useCase.execute(defaultCommand)).rejects.toThrow(GameErrorCode.PARTY_STAGES_NOT_AVAILABLE);
  });

  it('retries pin generation when a generated pin is already in use', async () => {
    // Arrange
    const { useCase, partyManagement } = arrangeCreatePartyUseCase();

    partyManagement.createParty.mockRejectedValueOnce(new PinAlreadyInUseError()).mockResolvedValueOnce({
      partyId: backendTestIdentifiers.party(88),
      gameId: backendTestIdentifiers.game(17),
      pin: '654321',
      status: 'WAITING',
      role: 'HOST',
      createdAt: new Date('2026-04-13T12:30:00.000Z'),
    });

    // Act
    const result = await useCase.execute(defaultCommand);

    // Assert
    expect(partyManagement.createParty).toHaveBeenCalledTimes(2);
    expect(result.pin).toBe('654321');
  });

  it('hashes private party passwords before persisting a party', async () => {
    // Arrange
    const { useCase, passwordService, partyManagement } = arrangeCreatePartyUseCase();

    // Act
    await useCase.execute({
      ...defaultCommand,
      privatePartyPassword: 'secret42',
    });

    // Assert
    expect(passwordService.hash).toHaveBeenCalledWith('secret42');
    expect(partyManagement.createParty).toHaveBeenCalledWith(
      expect.objectContaining({
        privatePartyPasswordHash: 'hashed-private-party-password',
      }),
    );
  });

  it('merges project defaults and party overrides into the created party settings', async () => {
    // Arrange
    const { useCase, partyManagement } = arrangeCreatePartyUseCase();

    partyManagement.findManagedGame.mockResolvedValue({
      gameId: backendTestIdentifiers.game(17),
      gameType: 'quiz',
      projectId: backendTestIdentifiers.project(6),
      organizationId: backendTestIdentifiers.organization(3),
      projectDefaultSettings: {
        allowOptionChangeAfterVoting: true,
        randomizeOptionOrder: false,
        randomizeStageOrder: true,
      },
      organizationDefaultSettings: {
        allowOptionChangeAfterVoting: false,
        randomizeOptionOrder: true,
        randomizeStageOrder: false,
      },
    });

    // Act
    await useCase.execute({
      ...defaultCommand,
      settingsOverride: {
        randomizeOptionOrder: true,
      },
    });

    // Assert
    expect(partyManagement.createParty).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: {
          allowOptionChangeAfterVoting: true,
          randomizeOptionOrder: true,
          randomizeStageOrder: true,
        },
      }),
    );
  });

  it('rejects invalid private party passwords', async () => {
    // Arrange
    const { useCase, passwordService, partyManagement } = arrangeCreatePartyUseCase();

    passwordService.isValidPassword.mockReturnValue(false);

    // Act + Assert
    await expect(
      useCase.execute({
        ...defaultCommand,
        privatePartyPassword: '123',
      }),
    ).rejects.toMatchObject({
      context: {
        gameId: defaultCommand.gameId,
        hostUserId: defaultCommand.hostUserId,
        privatePartyPasswordLength: 3,
      },
    });

    expect(passwordService.hash).not.toHaveBeenCalled();
    expect(partyManagement.createParty).not.toHaveBeenCalled();
  });

  it('rejects when pin generation keeps colliding', async () => {
    // Arrange
    const { useCase, partyManagement } = arrangeCreatePartyUseCase();

    partyManagement.createParty.mockRejectedValue(new PinAlreadyInUseError());

    // Act + Assert
    await expect(useCase.execute(defaultCommand)).rejects.toMatchObject({
      context: {
        attempts: 10,
        gameId: defaultCommand.gameId,
        hostUserId: defaultCommand.hostUserId,
      },
    });

    expect(partyManagement.createParty).toHaveBeenCalledTimes(10);
  });
});
