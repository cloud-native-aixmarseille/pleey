import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';
import {
  type GameBroadcastEvent,
  GameBroadcastEventType,
  type GameBroadcastService,
} from '../../../application/game/ports/game-broadcast.service';
import { buildSessionPlayerAvatarUri } from '../../../application/shared/utils/avatar-uri.util';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSessionId } from '../../../domain/game/entities/game-session';
import type { GuestId, PlayerState } from '../../../domain/game/entities/player-state';
import { mapQuestionToResponse } from '../../shared/mappers/question-response.mapper';
import { SOCKET_OUTBOUND_EVENT_BY_TYPE } from './socket-game-broadcast-events';

interface SocketPlayerPayload {
  id?: UserId;
  guestId?: GuestId;
  username: string;
  avatar: string;
}

/**
 * Socket.IO implementation of GameBroadcastService.
 * Handles all socket event emissions.
 */
@Injectable()
export class SocketGameBroadcastService implements GameBroadcastService {
  private server!: Server;

  /**
   * Set the Socket.IO server instance.
   * Must be called during gateway initialization.
   */
  setServer(server: Server): void {
    this.server = server;
  }

  private emitTo(target: string, type: GameBroadcastEvent['type'], payload: unknown): void {
    this.server.to(target).emit(SOCKET_OUTBOUND_EVENT_BY_TYPE[type], payload);
  }

  publish(event: GameBroadcastEvent): void {
    switch (event.type) {
      case GameBroadcastEventType.PLAYER_JOINED:
        this.emitTo(event.pin, event.type, {
          players: event.players.map((player) => this.mapPlayer(player, event.sessionId)),
        });
        return;
      case GameBroadcastEventType.GAME_STARTED:
        this.emitTo(event.pin, event.type, {
          question: mapQuestionToResponse(event.question),
          totalQuestions: event.totalQuestions,
        });
        return;
      case GameBroadcastEventType.NEXT_QUESTION:
        this.emitTo(event.pin, event.type, {
          question: mapQuestionToResponse(event.question),
        });
        return;
      case GameBroadcastEventType.GAME_PAUSED:
        this.emitTo(event.pin, event.type, { timeLeft: event.timeLeft });
        return;
      case GameBroadcastEventType.GAME_RESUMED:
        this.emitTo(event.pin, event.type, {
          question: mapQuestionToResponse(event.question),
          totalQuestions: event.totalQuestions,
          timeLeft: event.timeLeft,
        });
        return;
      case GameBroadcastEventType.GAME_ENDED:
        this.emitTo(event.pin, event.type, { leaderboard: event.leaderboard });
        return;
      case GameBroadcastEventType.ANSWER_ACKNOWLEDGED:
        this.emitTo(event.connectionId, event.type, { acknowledged: true });
        return;
      case GameBroadcastEventType.ANSWER_RESULT:
        this.emitTo(event.connectionId, event.type, event.result);
        return;
      case GameBroadcastEventType.LEADERBOARD_UPDATED:
        this.emitTo(event.pin, event.type, { leaderboard: event.leaderboard });
        return;
      case GameBroadcastEventType.GAME_STATE:
        this.emitTo(event.connectionId, event.type, {
          question: mapQuestionToResponse(event.question),
          totalQuestions: event.totalQuestions,
          timeLeft: event.timeLeft,
        });
        return;
    }
  }

  private mapPlayer(player: PlayerState, sessionId: GameSessionId): SocketPlayerPayload {
    return {
      id: player.userId,
      guestId: player.guestId,
      username: player.username,
      avatar: buildSessionPlayerAvatarUri(sessionId, player.avatarSeed),
    };
  }
}
