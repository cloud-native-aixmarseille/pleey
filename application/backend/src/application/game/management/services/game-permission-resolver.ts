import { Injectable } from '@nestjs/common';
import type { GameId } from '../../../../domain/game/entities/game';
import { GameErrorCode } from '../../../../domain/game/enums/game-error-code.enum';
import type { UserId } from '../../../../domain/identity/entities/user';
import type { ActionPermission } from '../../../../domain/shared/value-objects/action-permission';
import type { ActivePartyGameConflict } from '../../../game/party/shared/ports/party-management.port';
import { PartyManagementPort } from '../../../game/party/shared/ports/party-management.port';
import { PartyStageConfigurationPort } from '../../types/shared/ports/party-stage-configuration.port';
import {
  CreatePartyDisabledReason,
  type GamePermissions,
  LaunchReadinessDisabledReason,
} from '../ports/game-catalog.port';

@Injectable()
export class GamePermissionResolver {
  constructor(
    private readonly partyManagement: PartyManagementPort,
    private readonly partyStageConfiguration: PartyStageConfigurationPort,
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
          async (item) =>
            [item.gameId, await this.partyManagement.findActivePartyByGameId(item.gameId)] as const,
        ),
      ),
    );

    return new Map(
      items.map(
        (item) =>
          [
            item.gameId,
            this.buildGamePermissions({
              hasActiveParty: (activePartyByGameId.get(item.gameId) ?? null) !== null,
              hasHostConflictForAnotherGame: activeHostConflicts.some(
                (party) => party.gameId !== item.gameId,
              ),
              hasNoStages: item.stageCount <= 0,
              stageCount: item.stageCount,
            }),
          ] as const,
      ),
    );
  }

  async assertCanCreateParty({
    gameId,
    hostUserId,
  }: {
    gameId: GameId;
    hostUserId: UserId;
  }): Promise<void> {
    const [gameConflict, hostConflicts, stageCount] = await Promise.all([
      this.partyManagement.findActivePartyByGameId(gameId),
      this.partyManagement.findActivePartiesByHostId(hostUserId),
      this.partyStageConfiguration.getStageCount(gameId),
    ]);
    const permission = this.buildGamePermissions({
      hasActiveParty: gameConflict !== null,
      hasHostConflictForAnotherGame: hostConflicts.some((party) => party.gameId !== gameId),
      hasNoStages: stageCount <= 0,
      stageCount,
    }).createParty;

    if (!permission.allowed) {
      throw new Error(this.toCreatePartyErrorCode(permission.reason, gameConflict, hostUserId));
    }
  }

  private buildGamePermissions({
    hasActiveParty,
    hasHostConflictForAnotherGame,
    hasNoStages,
    stageCount,
  }: {
    hasActiveParty: boolean;
    hasHostConflictForAnotherGame: boolean;
    hasNoStages: boolean;
    stageCount: number;
  }): GamePermissions {
    const launchReadiness = this.resolveLaunchReadinessPermission({ hasNoStages, stageCount });

    return {
      createParty: this.resolveCreatePartyPermission({
        hasActiveParty,
        hasHostConflictForAnotherGame,
        launchReadiness,
      }),
      launchReadiness,
    };
  }

  private resolveLaunchReadinessPermission({
    hasNoStages,
    stageCount,
  }: {
    hasNoStages: boolean;
    stageCount: number;
  }): ActionPermission<LaunchReadinessDisabledReason> {
    void stageCount;

    if (hasNoStages) {
      return {
        allowed: false,
        reason: LaunchReadinessDisabledReason.NO_STAGES_AVAILABLE,
      };
    }

    return {
      allowed: true,
      reason: null,
    };
  }

  private resolveCreatePartyPermission({
    hasActiveParty,
    hasHostConflictForAnotherGame,
    launchReadiness,
  }: {
    hasActiveParty: boolean;
    hasHostConflictForAnotherGame: boolean;
    launchReadiness: ActionPermission<LaunchReadinessDisabledReason>;
  }): ActionPermission<CreatePartyDisabledReason> {
    if (!launchReadiness.allowed) {
      return {
        allowed: false,
        reason: CreatePartyDisabledReason.NO_STAGES_AVAILABLE,
      };
    }

    if (hasActiveParty) {
      return {
        allowed: false,
        reason: CreatePartyDisabledReason.ACTIVE_PARTY_EXISTS,
      };
    }

    if (hasHostConflictForAnotherGame) {
      return {
        allowed: false,
        reason: CreatePartyDisabledReason.HOST_HAS_ACTIVE_PARTY,
      };
    }

    return {
      allowed: true,
      reason: null,
    };
  }

  private toCreatePartyErrorCode(
    reason: CreatePartyDisabledReason | null,
    gameConflict: ActivePartyGameConflict | null,
    hostUserId: UserId,
  ): GameErrorCode {
    switch (reason) {
      case CreatePartyDisabledReason.NO_STAGES_AVAILABLE:
        return GameErrorCode.PARTY_STAGES_NOT_AVAILABLE;
      case CreatePartyDisabledReason.ACTIVE_PARTY_EXISTS:
        return gameConflict?.hostUserId === hostUserId
          ? GameErrorCode.HOST_ALREADY_HAS_ACTIVE_PARTY_FOR_GAME
          : GameErrorCode.GAME_ALREADY_HAS_ACTIVE_PARTY;
      case CreatePartyDisabledReason.HOST_HAS_ACTIVE_PARTY:
        return GameErrorCode.ACTIVE_PARTY_EXISTS;
      default:
        return GameErrorCode.VALIDATION_FAILED;
    }
  }
}
