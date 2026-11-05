import { injectable } from 'inversify';
import type {
  HostPartyRuntimeControlsState,
  PartyHostRuntimeControlsPort,
} from '../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import type { PartyObservation } from '../../../../../domains/game/party/shared/entities/party-observation';
import { PartyRuntimePhase } from '../../../../../domains/game/party/shared/entities/party-runtime-context';
import { PartyStatus } from '../../../../../domains/game/party/shared/entities/party-status';

@injectable()
export class HostPartyRuntimeControlsResolver implements PartyHostRuntimeControlsPort {
  resolveControls(party: PartyObservation): HostPartyRuntimeControlsState {
    const lifecycle = party.context?.lifecycle ?? null;
    const lifecyclePhase =
      lifecycle?.phase ?? (party.status === PartyStatus.ENDED ? PartyRuntimePhase.ENDED : PartyRuntimePhase.LOBBY);
    const hasNextStage =
      lifecycle?.stagePosition !== null &&
      lifecycle?.stagePosition !== undefined &&
      lifecycle.totalStages > lifecycle.stagePosition + 1;

    return {
      permissions: party.permissions,
      hasNextStage,
      isPaused: party.status === PartyStatus.PAUSED,
      lifecyclePhase,
    };
  }
}
