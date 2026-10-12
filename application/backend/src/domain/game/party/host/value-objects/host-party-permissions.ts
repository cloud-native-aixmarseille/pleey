import type { Permissions } from '../../../../shared/value-objects/action-permission';

export enum HostPartyDisabledReason {
  HOST_REQUIRED = 'HOST_REQUIRED',
  PARTY_NOT_WAITING = 'PARTY_NOT_WAITING',
  NO_PLAYERS = 'NO_PLAYERS',
  NO_STAGES = 'NO_STAGES',
  RUNTIME_UNAVAILABLE = 'RUNTIME_UNAVAILABLE',
  RESULT_REQUIRED = 'RESULT_REQUIRED',
  STAGE_REQUIRED = 'STAGE_REQUIRED',
  PREVIOUS_STAGE_REQUIRED = 'PREVIOUS_STAGE_REQUIRED',
  ACTIVE_PARTY_REQUIRED = 'ACTIVE_PARTY_REQUIRED',
  PAUSED_PARTY_REQUIRED = 'PAUSED_PARTY_REQUIRED',
  PARTY_ENDED = 'PARTY_ENDED',
}

export type HostPartyPermissions = Permissions<
  Record<
    | 'startParty'
    | 'advanceStage'
    | 'restartStage'
    | 'rewindStage'
    | 'rewindParty'
    | 'pauseParty'
    | 'resumeParty'
    | 'revealStageResult'
    | 'endParty',
    HostPartyDisabledReason
  >
>;
