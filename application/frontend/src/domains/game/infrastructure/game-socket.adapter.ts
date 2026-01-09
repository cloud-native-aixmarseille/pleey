import type {
  GameSocketOutboundEvent,
  IGameSocket,
} from "../ports/game-socket.interface";
import { socket } from "../../../infrastructure/socket/socket.client";
import type {
  OutboundPayloadByType,
  OutboundPayloadByTypeKey,
} from "./game-socket-outbound-events";

/**
 * Socket.IO implementation of Game Socket
 * Handles real-time game communication
 * Following Adapter Pattern and Single Responsibility Principle
 */
export class GameSocketAdapter implements IGameSocket {
  private emit<TEventType extends OutboundPayloadByTypeKey>(
    eventType: TEventType,
    payload: OutboundPayloadByType[TEventType],
  ): void {
    socket.emit(eventType, payload);
  }

  publish(event: GameSocketOutboundEvent): void {
    switch (event.type) {
      case "join-game": {
        const payload: {
          pin: string;
          username: string;
          userId?: number;
          guestId?: string;
        } = { pin: event.pin, username: event.username };

        if (event.userId !== undefined) {
          payload.userId = event.userId;
        }

        if (event.guestId !== undefined) {
          payload.guestId = event.guestId;
        }

        this.emit(event.type, payload);
        return;
      }
      case "start-game":
        this.emit(event.type, { pin: event.pin });
        return;
      case "stop-game":
        this.emit(event.type, { pin: event.pin, hostId: event.hostId });
        return;
      case "resume-game":
        this.emit(event.type, { pin: event.pin, hostId: event.hostId });
        return;
      case "end-game":
        this.emit(event.type, { pin: event.pin, hostId: event.hostId });
        return;
      case "submit-answer": {
        const payload: {
          pin: string;
          userId?: number;
          guestId?: string;
          answer: string;
          timeLeft: number;
        } = {
          pin: event.pin,
          answer: event.answer,
          timeLeft: event.timeLeft,
        };

        if (event.userId !== undefined) {
          payload.userId = event.userId;
        }

        if (event.guestId !== undefined) {
          payload.guestId = event.guestId;
        }

        this.emit(event.type, payload);
        return;
      }
      case "next-question":
        this.emit(event.type, { pin: event.pin });
        return;
    }
  }
}
