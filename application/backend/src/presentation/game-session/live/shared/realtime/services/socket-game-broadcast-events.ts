import {
  type GameBroadcastEvent,
  GameBroadcastEventType,
} from '../../../../../../domain/game/ports/services/game-broadcast.service';

const GAME_SOCKET_BROADCAST_OUTBOUND_EVENT = {
  PLAYER_JOINED: 'player-joined',
  GAME_STARTED: 'game-started',
  NEXT_STAGE: 'next-stage',
  RESULT_REVEALED: 'result-revealed',
  RETURNED_TO_LOBBY: 'returned-to-lobby',
  GAME_PAUSED: 'game-paused',
  GAME_RESUMED: 'game-resumed',
  GAME_ENDED: 'game-ended',
  ACTION_SUBMITTED: 'action-submitted',
  ACTION_RESULT: 'action-result',
  LEADERBOARD_UPDATED: 'leaderboard-updated',
} as const;

type GameSocketBroadcastOutboundEventName =
  (typeof GAME_SOCKET_BROADCAST_OUTBOUND_EVENT)[keyof typeof GAME_SOCKET_BROADCAST_OUTBOUND_EVENT];

export const SOCKET_OUTBOUND_EVENT_BY_TYPE = {
  [GameBroadcastEventType.PLAYER_JOINED]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.PLAYER_JOINED,
  [GameBroadcastEventType.GAME_STARTED]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.GAME_STARTED,
  [GameBroadcastEventType.NEXT_STAGE]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.NEXT_STAGE,
  [GameBroadcastEventType.RESULT_REVEALED]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.RESULT_REVEALED,
  [GameBroadcastEventType.RETURNED_TO_LOBBY]:
    GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.RETURNED_TO_LOBBY,
  [GameBroadcastEventType.GAME_PAUSED]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.GAME_PAUSED,
  [GameBroadcastEventType.GAME_RESUMED]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.GAME_RESUMED,
  [GameBroadcastEventType.GAME_ENDED]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.GAME_ENDED,
  [GameBroadcastEventType.ACTION_ACKNOWLEDGED]:
    GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.ACTION_SUBMITTED,
  [GameBroadcastEventType.ACTION_RESULT]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.ACTION_RESULT,
  [GameBroadcastEventType.LEADERBOARD_UPDATED]:
    GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.LEADERBOARD_UPDATED,
  [GameBroadcastEventType.GAME_STATE]: GAME_SOCKET_BROADCAST_OUTBOUND_EVENT.GAME_RESUMED,
} as const satisfies Record<GameBroadcastEvent['type'], GameSocketBroadcastOutboundEventName>;
