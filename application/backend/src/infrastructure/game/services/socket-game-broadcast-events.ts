import type { GameBroadcastEvent } from '../../../application/game/ports/game-broadcast.service.interface';

export const GAME_SOCKET_BROADCAST_OUTBOUND_EVENT = {
  PLAYER_JOINED: 'player-joined',
  GAME_STARTED: 'game-started',
  NEXT_QUESTION: 'next-question',
  GAME_PAUSED: 'game-paused',
  GAME_RESUMED: 'game-resumed',
  GAME_ENDED: 'game-ended',
  ANSWER_SUBMITTED: 'answer-submitted',
  ANSWER_RESULT: 'answer-result',
  LEADERBOARD_UPDATED: 'leaderboard-updated',
} as const;

export type GameSocketBroadcastOutboundEventName =
  (typeof GAME_SOCKET_BROADCAST_OUTBOUND_EVENT)[keyof typeof GAME_SOCKET_BROADCAST_OUTBOUND_EVENT];

export const SOCKET_OUTBOUND_EVENT_BY_TYPE = {
  'player-joined': GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.PLAYER_JOINED,
  'game-started': GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.GAME_STARTED,
  'next-question': GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.NEXT_QUESTION,
  'game-paused': GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.GAME_PAUSED,
  'game-resumed': GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.GAME_RESUMED,
  'game-ended': GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.GAME_ENDED,
  'answer-acknowledged': GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.ANSWER_SUBMITTED,
  'answer-result': GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.ANSWER_RESULT,
  'leaderboard-updated': GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.LEADERBOARD_UPDATED,
  'game-state': GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.GAME_RESUMED,
} as const satisfies Record<GameBroadcastEvent['type'], GameSocketBroadcastOutboundEventName>;
