import { describe, expect, it } from 'vitest';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import { PartyStageConfigurationPort } from '../../types/shared/ports/party-stage-configuration.port';
import {
  CreatePartyDisabledReason,
  LaunchReadinessDisabledReason,
} from '../ports/game-catalog.port';
import { GamePermissionResolver } from './game-permission-resolver';

describe('GamePermissionResolver', () => {
  const partyManagement = {
    findActivePartyByGameId: async () => null,
    findActivePartiesByHostId: async () => [],
  };
  const partyStageConfiguration = {
    getStageCount: async () => 1,
  } satisfies PartyStageConfigurationPort;
  const resolver = new GamePermissionResolver(partyManagement as never, partyStageConfiguration);

  it('allows party creation with no conflicts', async () => {
    await expect(
      resolver.resolveGamePermissions({
        items: [{ gameId: 17, stageCount: 4 }],
        hostUserId: 42,
      }),
    ).resolves.toEqual(
      new Map([
        [
          17,
          {
            createParty: {
              allowed: true,
              reason: null,
            },
            launchReadiness: {
              allowed: true,
              reason: null,
            },
          },
        ],
      ]),
    );
  });

  it('disables other listed games when the host already owns an active party for one listed game', async () => {
    const resolver = new GamePermissionResolver(
      {
        findActivePartyByGameId: async (gameId: number) =>
          gameId === 17 ? { partyId: 8, gameId: 17, hostUserId: 42 } : null,
        findActivePartiesByHostId: async () => [{ partyId: 8, gameId: 17, hostUserId: 42 }],
      } as never,
      partyStageConfiguration,
    );

    await expect(
      resolver.resolveGamePermissions({
        items: [
          { gameId: 17, stageCount: 3 },
          { gameId: 18, stageCount: 2 },
        ],
        hostUserId: 42,
      }),
    ).resolves.toEqual(
      new Map([
        [
          17,
          {
            createParty: {
              allowed: false,
              reason: CreatePartyDisabledReason.ACTIVE_PARTY_EXISTS,
            },
            launchReadiness: {
              allowed: true,
              reason: null,
            },
          },
        ],
        [
          18,
          {
            createParty: {
              allowed: false,
              reason: CreatePartyDisabledReason.HOST_HAS_ACTIVE_PARTY,
            },
            launchReadiness: {
              allowed: true,
              reason: null,
            },
          },
        ],
      ]),
    );
  });

  it('disables party creation when the game has no configured stages', async () => {
    await expect(
      resolver.resolveGamePermissions({
        items: [{ gameId: 17, stageCount: 0 }],
        hostUserId: 42,
      }),
    ).resolves.toEqual(
      new Map([
        [
          17,
          {
            createParty: {
              allowed: false,
              reason: CreatePartyDisabledReason.NO_STAGES_AVAILABLE,
            },
            launchReadiness: {
              allowed: false,
              reason: LaunchReadinessDisabledReason.NO_STAGES_AVAILABLE,
            },
          },
        ],
      ]),
    );
  });

  it('assertCanCreateParty throws when another active party already exists for the game', async () => {
    const resolver = new GamePermissionResolver(
      {
        findActivePartyByGameId: async () => ({ partyId: 8, hostUserId: 7 }),
        findActivePartiesByHostId: async () => [],
      } as never,
      partyStageConfiguration,
    );

    await expect(
      resolver.assertCanCreateParty({
        gameId: 17,
        hostUserId: 42,
      }),
    ).rejects.toThrow(GameErrorCode.GAME_ALREADY_HAS_ACTIVE_PARTY);
  });

  it('assertCanCreateParty throws when the same host already owns an active party for the game', async () => {
    const resolver = new GamePermissionResolver(
      {
        findActivePartyByGameId: async () => ({ partyId: 8, hostUserId: 42 }),
        findActivePartiesByHostId: async () => [],
      } as never,
      partyStageConfiguration,
    );

    await expect(
      resolver.assertCanCreateParty({
        gameId: 17,
        hostUserId: 42,
      }),
    ).rejects.toThrow(GameErrorCode.HOST_ALREADY_HAS_ACTIVE_PARTY_FOR_GAME);
  });

  it('assertCanCreateParty throws when the host already owns another active party', async () => {
    const resolver = new GamePermissionResolver(
      {
        findActivePartyByGameId: async () => null,
        findActivePartiesByHostId: async () => [{ partyId: 12, gameId: 99 }],
      } as never,
      partyStageConfiguration,
    );

    await expect(
      resolver.assertCanCreateParty({
        gameId: 17,
        hostUserId: 42,
      }),
    ).rejects.toThrow(GameErrorCode.ACTIVE_PARTY_EXISTS);
  });

  it('assertCanCreateParty throws when the game has no configured stages', async () => {
    const resolver = new GamePermissionResolver(partyManagement as never, {
      getStageCount: async () => 0,
    } satisfies PartyStageConfigurationPort);

    await expect(
      resolver.assertCanCreateParty({
        gameId: 17,
        hostUserId: 42,
      }),
    ).rejects.toThrow(GameErrorCode.PARTY_STAGES_NOT_AVAILABLE);
  });
});
