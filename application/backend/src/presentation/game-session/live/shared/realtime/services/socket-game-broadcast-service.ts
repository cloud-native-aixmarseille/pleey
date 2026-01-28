import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';
import {
  type GameBroadcastEvent,
  type GameBroadcastService,
} from '../../../../../../domain/game/ports/services/game-broadcast.service';
import { SOCKET_OUTBOUND_EVENT_BY_TYPE } from './socket-game-broadcast-events';
import { SocketGameBroadcastMessageMapper } from './socket-game-broadcast-message-mapper';

@Injectable()
export class SocketGameBroadcastService implements GameBroadcastService {
  private server!: Server;

  constructor(private readonly messageMapper: SocketGameBroadcastMessageMapper) {}

  setServer(server: Server): void {
    this.server = server;
  }

  private emitTo(target: string, type: GameBroadcastEvent['type'], payload: unknown): void {
    this.server.to(target).emit(SOCKET_OUTBOUND_EVENT_BY_TYPE[type], payload);
  }

  publish(event: GameBroadcastEvent): void {
    const message = this.messageMapper.map(event);
    this.emitTo(message.target, event.type, message.payload);
  }
}
