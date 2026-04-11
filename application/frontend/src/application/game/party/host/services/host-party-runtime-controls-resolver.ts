import { injectable } from 'inversify';
import type {
  HostPartyRuntimeControlsState,
  PartyHostRuntimeControlsPort,
} from '../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import { PARTY_RUNTIME_PHASE } from '../../../../../domains/game/party/shared/entities/party-runtime-context';
import { PartyStatus } from '../../../../../domains/game/party/shared/entities/party-status';

@injectable()
export class HostPartyRuntimeControlsResolver implements PartyHostRuntimeControlsPort {
  resolveControls(party: PartyObservation): HostPartyRuntimeControlsState {
    const lifecycle = party.context?.lifecycle ?? null;
    const lifecyclePhase =
      lifecycle?.phase ??
      (party.status === PartyStatus.ENDED ? PARTY_RUNTIME_PHASE.ENDED : PARTY_RUNTIME_PHASE.LOBBY);
    const currentStageNumber =
      lifecycle?.stagePosition === null || lifecycle?.stagePosition === undefined
        ? null
        : lifecycle.stagePosition + 1;
    const totalStages = lifecycle?.totalStages ?? null;
    const hasPlayableLifecycle =
      lifecyclePhase === PARTY_RUNTIME_PHASE.STAGE || lifecyclePhase === PARTY_RUNTIME_PHASE.RESULT;
    const canControlActiveRuntime =
      (party.status === PartyStatus.ACTIVE || party.status === PartyStatus.PAUSED) &&
      hasPlayableLifecycle;
    const hasNextStage =
      lifecycle?.stagePosition !== null &&
      lifecycle?.stagePosition !== undefined &&
      lifecycle.totalStages > lifecycle.stagePosition + 1;

    return {
      canAdvanceStage:
        party.status === PartyStatus.ACTIVE && lifecyclePhase === PARTY_RUNTIME_PHASE.RESULT,
      canEndParty: party.status !== PartyStatus.ENDED,
      canPauseParty: party.status === PartyStatus.ACTIVE && canControlActiveRuntime,
      canRestartStage: canControlActiveRuntime && currentStageNumber !== null,
      canResumeParty: party.status === PartyStatus.PAUSED && canControlActiveRuntime,
      canRevealStageResult:
        party.status === PartyStatus.ACTIVE && lifecyclePhase === PARTY_RUNTIME_PHASE.STAGE,
      canRewindParty: canControlActiveRuntime,
      canRewindStage:
        canControlActiveRuntime && currentStageNumber !== null && currentStageNumber > 1,
      canStartParty: party.status === PartyStatus.WAITING && party.players.length > 0,
      currentStageNumber,
      hasNextStage,
      isPaused: party.status === PartyStatus.PAUSED,
      lifecyclePhase,
      totalStages,
    };
  }
}
