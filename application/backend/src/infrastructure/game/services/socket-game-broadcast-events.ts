import {
  type GameBroadcastEvent,
  GameBroadcastEventType,
} from '../../../application/game/ports/game-broadcast.service';

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
  [GameBroadcastEventType.PLAYER_JOINED]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.PLAYER_JOINED,
  [GameBroadcastEventType.GAME_STARTED]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.GAME_STARTED,
  [GameBroadcastEventType.NEXT_QUESTION]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.NEXT_QUESTION,
  [GameBroadcastEventType.GAME_PAUSED]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.GAME_PAUSED,
  [GameBroadcastEventType.GAME_RESUMED]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.GAME_RESUMED,
  [GameBroadcastEventType.GAME_ENDED]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.GAME_ENDED,
  [GameBroadcastEventType.ANSWER_ACKNOWLEDGED]:
    GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.ANSWER_SUBMITTED,
  [GameBroadcastEventType.ANSWER_RESULT]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.ANSWER_RESULT,
  [GameBroadcastEventType.LEADERBOARD_UPDATED]:
    GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.LEADERBOARD_UPDATED,
  [GameBroadcastEventType.GAME_STATE]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.GAME_RESUMED,
} as const satisfies Record<GameBroadcastEvent['type'], GameSocketBroadcastOutboundEventName>;
