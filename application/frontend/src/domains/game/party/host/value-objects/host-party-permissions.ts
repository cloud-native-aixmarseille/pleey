import {
  HostPartyDisabledReason as SharedHostPartyDisabledReason,
  type HostPartyPermissions as SharedHostPartyPermissions,
} from '@pleey/domain/party';

export const HostPartyDisabledReason = {
  ...SharedHostPartyDisabledReason,
  UNAVAILABLE: 'PERMISSION_UNAVAILABLE',
} as const;
export type HostPartyDisabledReason = (typeof HostPartyDisabledReason)[keyof typeof HostPartyDisabledReason];

export type HostPartyPermissions = SharedHostPartyPermissions<HostPartyDisabledReason>;

export function unavailableHostPermissions(): HostPartyPermissions {
  return {
    startParty: { allowed: false, reason: HostPartyDisabledReason.UNAVAILABLE },
    endParty: { allowed: false, reason: HostPartyDisabledReason.UNAVAILABLE },
    advanceStage: { allowed: false, reason: HostPartyDisabledReason.UNAVAILABLE },
    restartStage: { allowed: false, reason: HostPartyDisabledReason.UNAVAILABLE },
    rewindStage: { allowed: false, reason: HostPartyDisabledReason.UNAVAILABLE },
    rewindParty: { allowed: false, reason: HostPartyDisabledReason.UNAVAILABLE },
    pauseParty: { allowed: false, reason: HostPartyDisabledReason.UNAVAILABLE },
    resumeParty: { allowed: false, reason: HostPartyDisabledReason.UNAVAILABLE },
    revealStageResult: { allowed: false, reason: HostPartyDisabledReason.UNAVAILABLE },
  };
}
