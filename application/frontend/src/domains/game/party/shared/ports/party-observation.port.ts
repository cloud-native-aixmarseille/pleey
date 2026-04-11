import type { PartyId } from '../entities/party';
import type { PartyObservation } from '../entities/party-observation';

export enum PartyRuntimeNoticeKind {
  RestartStage = 'restartStage',
  RewindParty = 'rewindParty',
  RewindStage = 'rewindStage',
}

export interface PartyRuntimeNotice {
  readonly kind: PartyRuntimeNoticeKind;
  readonly partyId: PartyId;
}

export interface PartyObservationHandlers {
  readonly onError?: (message: string) => void;
  readonly onRuntimeNotice?: (notice: PartyRuntimeNotice) => void;
  readonly onSnapshot: (party: PartyObservation) => void;
}

export interface PartyObservationPort {
  observeParty(partyId: PartyId, handlers: PartyObservationHandlers): () => void;
}

export const PartyObservationPortToken = Symbol('PartyObservationPort');
