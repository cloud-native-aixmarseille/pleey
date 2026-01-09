export const GAME_SOCKET_INBOUND_EVENT = {
  JOIN_GAME: 'join-game',
  START_GAME: 'start-game',
  SUBMIT_ANSWER: 'submit-answer',
  NEXT_QUESTION: 'next-question',
  STOP_GAME: 'stop-game',
  RESUME_GAME: 'resume-game',
  END_GAME: 'end-game',
} as const;

export type GameSocketInboundEventName =
  (typeof GAME_SOCKET_INBOUND_EVENT)[keyof typeof GAME_SOCKET_INBOUND_EVENT];

export const GAME_SOCKET_OUTBOUND_EVENT = {
  ERROR: 'error',
} as const;

export type GameSocketOutboundEventName =
  (typeof GAME_SOCKET_OUTBOUND_EVENT)[keyof typeof GAME_SOCKET_OUTBOUND_EVENT];
