export const GAME_SOCKET_INBOUND_EVENT = {
  JOIN_GAME: 'join-game',
  OBSERVE_SESSION: 'observe-session',
  START_GAME: 'start-game',
  SUBMIT_ACTION: 'submit-action',
  NEXT_STAGE: 'next-stage',
  RESTART_STAGE: 'restart-stage',
  PREVIOUS_STAGE: 'previous-stage',
  RETURN_TO_LOBBY: 'return-to-lobby',
  STOP_GAME: 'stop-game',
  RESUME_GAME: 'resume-game',
  END_GAME: 'end-game',
} as const;

export const GAME_SOCKET_OUTBOUND_EVENT = {
  ERROR: 'error',
} as const;
