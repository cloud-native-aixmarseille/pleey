export const PARTY_SOCKET_INBOUND_EVENTS = {
  JOIN_PARTY: 'join-party',
  LEAVE_PARTY: 'leave-party',
  OBSERVE_PARTY: 'observe-party',
  REJOIN_PARTY: 'rejoin-party',
  SUBMIT_ACTION: 'submit-action',
  START_PARTY: 'start-party',
  ADVANCE_STAGE: 'advance-stage',
  RESTART_STAGE: 'restart-stage',
  REWIND_STAGE: 'rewind-stage',
  REWIND_PARTY: 'rewind-party',
  PAUSE_PARTY: 'pause-party',
  RESUME_PARTY: 'resume-party',
  REVEAL_STAGE_RESULT: 'reveal-stage-result',
  END_PARTY: 'end-party',
  KICK_PLAYER: 'kick-player',
  STOP_OBSERVING_PARTY: 'stop-observing-party',
} as const;

export const PARTY_SOCKET_OUTBOUND_EVENTS = {
  PARTY_RUNTIME_NOTICE: 'party-runtime-notice',
  PARTY_SNAPSHOT: 'party-snapshot',
  PARTY_UPDATED: 'party-updated',
} as const;

export type PartyRuntimeNoticeKind = 'restartStage' | 'rewindParty' | 'rewindStage';

export function resolvePartyObservationRoom(partyId: number): string {
  return `party:${partyId}`;
}
