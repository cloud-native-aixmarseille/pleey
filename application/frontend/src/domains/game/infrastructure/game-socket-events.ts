import type { Socket } from "socket.io-client";

import { socket } from "../../../infrastructure/socket/socket.client";
import type {
  GameSocketInboundEventMap,
  GameSocketInboundEventName,
} from "./game-socket-inbound-events";

export type { GameSocketInboundEventMap, GameSocketInboundEventName };
export { GAME_SOCKET_INBOUND_EVENT } from "./game-socket-inbound-events";

function getSocketInstance(): Pick<Socket, "on" | "off"> {
  return socket;
}

export function onGameSocketEvent<E extends GameSocketInboundEventName>(
  event: E,
  handler: (payload: GameSocketInboundEventMap[E]) => void,
): void {
  getSocketInstance().on(event, handler as never);
}

export function offGameSocketEvent<E extends GameSocketInboundEventName>(
  event: E,
  handler?: (payload: GameSocketInboundEventMap[E]) => void,
): void {
  if (handler) {
    getSocketInstance().off(event, handler as never);
    return;
  }

  getSocketInstance().off(event);
}
