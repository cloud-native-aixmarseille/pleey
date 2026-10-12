import type { Permissions } from '../../../shared/value-objects/action-permission';

export enum CreatePartyDisabledReason {
  ACTIVE_PARTY_EXISTS = 'GAME_ALREADY_HAS_ACTIVE_PARTY',
  HOST_HAS_ACTIVE_PARTY = 'ACTIVE_PARTY_EXISTS',
  NO_STAGES_AVAILABLE = 'PARTY_STAGES_NOT_AVAILABLE',
}

export enum LaunchReadinessDisabledReason {
  NO_STAGES_AVAILABLE = 'PARTY_STAGES_NOT_AVAILABLE',
}

export type GamePermissions = Permissions<{
  createParty: CreatePartyDisabledReason;
  launchReadiness: LaunchReadinessDisabledReason;
}>;
