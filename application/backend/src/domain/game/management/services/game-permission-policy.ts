import type { ActionPermission } from '../../../shared/value-objects/action-permission';
import {
  CreatePartyDisabledReason,
  type GamePermissions,
  LaunchReadinessDisabledReason,
} from '../value-objects/game-permissions';

export function resolveGamePermissions({
  hasActiveParty,
  hasHostConflictForAnotherGame,
  stageCount,
}: {
  hasActiveParty: boolean;
  hasHostConflictForAnotherGame: boolean;
  stageCount: number;
}): GamePermissions {
  const launchReadiness = resolveLaunchReadinessPermission({ stageCount });

  return {
    createParty: resolveCreatePartyPermission({
      hasActiveParty,
      hasHostConflictForAnotherGame,
      launchReadiness,
    }),
    launchReadiness,
  };
}

function resolveLaunchReadinessPermission({
  stageCount,
}: {
  stageCount: number;
}): ActionPermission<LaunchReadinessDisabledReason> {
  if (!(stageCount > 0)) {
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

function resolveCreatePartyPermission({
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
