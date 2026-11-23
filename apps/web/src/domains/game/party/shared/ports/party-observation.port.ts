import type { PartyId, PartyRuntimeNoticeKind as SharedPartyRuntimeNoticeKind } from '@pleey/contracts/party';
import { PARTY_RUNTIME_NOTICE_KINDS } from '@pleey/contracts/party';
import type { PartyObservation } from '../entities/party-observation';

export const PartyRuntimeNoticeKind = PARTY_RUNTIME_NOTICE_KINDS;
export type PartyRuntimeNoticeKind = SharedPartyRuntimeNoticeKind;

export interface PartyObservationConnectionState {
  readonly epoch: number;
  readonly recovered: boolean;
  readonly reconnected: boolean;
}

export interface PartyRuntimeNotice {
  readonly kind: PartyRuntimeNoticeKind;
  readonly partyId: PartyId;
}

export interface PartyObservationHandlers {
  readonly onDisconnected?: () => void;
  readonly onConnected?: (state: PartyObservationConnectionState) => void;
  readonly onError?: (message: string) => void;
  readonly onRuntimeNotice?: (notice: PartyRuntimeNotice) => void;
  readonly onSnapshot: (party: PartyObservation) => void;
}

export interface PartyObservationPort {
  observeParty(partyId: PartyId, handlers: PartyObservationHandlers): () => void;
}

export const PartyObservationPortToken = Symbol('PartyObservationPort');
