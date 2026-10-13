import { Inject, Injectable } from '@nestjs/common';
import type { GameId } from '../../../../domain/game/entities/game';
import {
  ActivePartyExistsError,
  GameAlreadyHasActivePartyError,
  GameValidationFailedError,
  HostAlreadyHasActivePartyForGameError,
  PartyStagesNotAvailableError,
} from '../../../../domain/game/errors';
import { GamePermissionPolicy } from '../../../../domain/game/management/services/game-permission-policy';
import {
  CreatePartyDisabledReason,
  type GamePermissions,
} from '../../../../domain/game/management/value-objects/game-permissions';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { DomainError } from '../../../../domain/shared/errors/domain-error';
import type {
  ActivePartyGameConflict,
  ActivePartyHostConflict,
} from '../../../game/party/shared/ports/party-management.port';
import { PartyManagementPort } from '../../../game/party/shared/ports/party-management.port';
import { PartyStageConfigurationPort } from '../../types/shared/ports/party-stage-configuration.port';

@Injectable()
export class GamePermissionResolver {
  constructor(
    private readonly partyManagement: PartyManagementPort,
    private readonly partyStageConfiguration: PartyStageConfigurationPort,
    @Inject(GamePermissionPolicy) private readonly policy: GamePermissionPolicy,
  ) {}

  async resolveGamePermissions({
    items,
    hostUserId,
  }: {
    items: readonly {
      gameId: GameId;
      stageCount: number;
    }[];
    hostUserId: UserId;
  }): Promise<Map<GameId, GamePermissions>> {
    const activeHostConflicts = await this.partyManagement.findActivePartiesByHostId(hostUserId);
    const activePartyByGameId = new Map<GameId, ActivePartyGameConflict | null>(
      await Promise.all(
        items.map(
          async (item) => [item.gameId, await this.partyManagement.findActivePartyByGameId(item.gameId)] as const,
        ),
      ),
    );

    return new Map(
      items.map(
        (item) =>
          [
            item.gameId,
            this.policy.resolve({
              hasActiveParty: (activePartyByGameId.get(item.gameId) ?? null) !== null,
              hasHostConflictForAnotherGame: activeHostConflicts.some((party) => party.gameId !== item.gameId),
              stageCount: item.stageCount,
            }),
          ] as const,
      ),
    );
  }

  async assertCanCreateParty({ gameId, hostUserId }: { gameId: GameId; hostUserId: UserId }): Promise<void> {
    const [gameConflict, hostConflicts, stageCount] = await Promise.all([
      this.partyManagement.findActivePartyByGameId(gameId),
      this.partyManagement.findActivePartiesByHostId(hostUserId),
      this.partyStageConfiguration.getStageCount(gameId),
    ]);
    const permission = this.policy.resolve({
      hasActiveParty: gameConflict !== null,
      hasHostConflictForAnotherGame: hostConflicts.some((party) => party.gameId !== gameId),
      stageCount,
    }).createParty;

    if (!permission.allowed) {
      throw this.toCreatePartyError({
        gameConflict,
        gameId,
        hostConflicts,
        hostUserId,
        reason: permission.reason,
        stageCount,
      });
    }
  }

  private toCreatePartyError({
    reason,
    gameConflict,
    hostConflicts,
    hostUserId,
    gameId,
    stageCount,
  }: {
    readonly reason: CreatePartyDisabledReason | null;
    readonly gameConflict: ActivePartyGameConflict | null;
    readonly hostConflicts: readonly ActivePartyHostConflict[];
    readonly hostUserId: UserId;
    readonly gameId: GameId;
    readonly stageCount: number;
  }): DomainError<string> {
    const activePartyId = gameConflict?.partyId ?? null;

    switch (reason) {
      case CreatePartyDisabledReason.NO_STAGES_AVAILABLE:
        return new PartyStagesNotAvailableError({
          gameId,
          hostUserId,
          stageCount,
        });
      case CreatePartyDisabledReason.ACTIVE_PARTY_EXISTS:
        return gameConflict?.hostUserId === hostUserId
          ? new HostAlreadyHasActivePartyForGameError({
              activePartyId,
              gameId,
              hostUserId,
            })
          : new GameAlreadyHasActivePartyError({
              activePartyId,
              gameId,
              hostUserId,
            });
      case CreatePartyDisabledReason.HOST_HAS_ACTIVE_PARTY:
        return new ActivePartyExistsError({
          conflictingPartyIds: hostConflicts.map((party) => party.partyId),
          gameId,
          hostUserId,
        });
      default:
        return new GameValidationFailedError({
          gameConflict,
          gameId,
          hostUserId,
          reason,
          stageCount,
        });
    }
  }
}
