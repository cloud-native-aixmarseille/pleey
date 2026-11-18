export const PARTY_SOCKET_INBOUND_EVENTS: {
  readonly JOIN_PARTY: 'join-party';
  readonly LEAVE_PARTY: 'leave-party';
  readonly OBSERVE_PARTY: 'observe-party';
  readonly REJOIN_PARTY: 'rejoin-party';
  readonly REQUEST_PARTY_MEDIA: 'request-party-media';
  readonly SUBMIT_ACTION: 'submit-action';
  readonly START_PARTY: 'start-party';
  readonly ADVANCE_STAGE: 'advance-stage';
  readonly RESTART_STAGE: 'restart-stage';
  readonly REWIND_STAGE: 'rewind-stage';
  readonly REWIND_PARTY: 'rewind-party';
  readonly PAUSE_PARTY: 'pause-party';
  readonly RESUME_PARTY: 'resume-party';
  readonly REVEAL_STAGE_RESULT: 'reveal-stage-result';
  readonly END_PARTY: 'end-party';
  readonly KICK_PLAYER: 'kick-player';
  readonly STOP_OBSERVING_PARTY: 'stop-observing-party';
};

export const PARTY_SOCKET_OUTBOUND_EVENTS: {
  readonly PARTY_RUNTIME_NOTICE: 'party-runtime-notice';
  readonly PARTY_SNAPSHOT: 'party-snapshot';
  readonly PARTY_UPDATED: 'party-updated';
};

export const PARTY_RUNTIME_NOTICE_KINDS: {
  readonly RestartStage: 'restartStage';
  readonly RewindParty: 'rewindParty';
  readonly RewindStage: 'rewindStage';
};

export type PartyRuntimeNoticeKind = (typeof PARTY_RUNTIME_NOTICE_KINDS)[keyof typeof PARTY_RUNTIME_NOTICE_KINDS];
