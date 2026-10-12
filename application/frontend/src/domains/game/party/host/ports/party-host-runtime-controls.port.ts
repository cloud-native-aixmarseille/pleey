import type { PartyObservation } from '../../shared/entities/party-observation';
import type { PartyRuntimePhase } from '../../shared/entities/party-runtime-context';
import type { HostPartyPermissions } from '../value-objects/host-party-permissions';

export enum HostPartyRuntimeCommand {
  AdvanceStage = 'advanceStage',
  EndParty = 'endParty',
  PauseParty = 'pauseParty',
  RestartStage = 'restartStage',
  ResumeParty = 'resumeParty',
  RevealStageResult = 'revealStageResult',
  RewindParty = 'rewindParty',
  RewindStage = 'rewindStage',
  StartParty = 'startParty',
}

export interface HostPartyRuntimeControlsState {
  readonly permissions: HostPartyPermissions;
  readonly currentStageNumber: number | null;
  readonly hasNextStage: boolean;
  readonly isPaused: boolean;
  readonly lifecyclePhase: PartyRuntimePhase;
  readonly totalStages: number | null;
}

export interface PartyHostRuntimeControlsPort {
  resolveControls(party: PartyObservation): HostPartyRuntimeControlsState;
}

export const PartyHostRuntimeControlsPortToken = Symbol('PartyHostRuntimeControlsPort');
