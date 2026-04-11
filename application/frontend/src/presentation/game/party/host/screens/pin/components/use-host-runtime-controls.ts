import type { HostPartyRuntimeControlsState } from '../../../../../../../domains/game/party/host/ports/party-host-runtime-controls.port';
import type { PartyObservation } from '../../../../../../../domains/game/party/shared/entities/party-observation';
import { usePartyDependencies } from '../../../../shared/contexts/party-dependencies-context';

export function useHostRuntimeControls(party: PartyObservation): HostPartyRuntimeControlsState {
  const { hostPartyRuntimeControlsResolver } = usePartyDependencies();

  return hostPartyRuntimeControlsResolver.resolveControls(party);
}
