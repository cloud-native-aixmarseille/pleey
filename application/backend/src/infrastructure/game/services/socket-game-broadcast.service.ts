import { Injectable } from '@nestjs/common';
import type { Server } from 'socket.io';
import type {
  GameBroadcastEvent,
  GameBroadcastService,
} from '../../../application/game/ports/game-broadcast.service.interface';
import { buildSessionPlayerAvatarUrl } from '../../../application/shared/utils/avatar-url.util';
import type { PlayerState } from '../../../domain/game/entities/player-state';
import type { Question } from '../../../domain/quiz/entities/question';
import { SOCKET_OUTBOUND_EVENT_BY_TYPE } from './socket-game-broadcast-events';

interface SocketPlayerPayload {
  id?: number;
  guestId?: string;
  username: string;
  avatar: string;
  isGuest: boolean;
}

interface SocketQuestionPayload {
  id: number;
  quiz_id: number;
  question_text: string;
  type: string;
  correct_answer: string;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
  time_limit: number;
  points: number;
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
      case 'player-joined':
        this.emitTo(event.pin, event.type, {
          players: event.players.map((player) => this.mapPlayer(player, event.sessionId)),
        });
        return;
      case 'game-started':
        this.emitTo(event.pin, event.type, {
          question: this.mapQuestion(event.question),
          questionNumber: event.questionNumber,
          totalQuestions: event.totalQuestions,
        });
        return;
      case 'next-question':
        this.emitTo(event.pin, event.type, {
          question: this.mapQuestion(event.question),
          questionNumber: event.questionNumber,
        });
        return;
      case 'game-paused':
        this.emitTo(event.pin, event.type, { timeLeft: event.timeLeft });
        return;
      case 'game-resumed':
        this.emitTo(event.pin, event.type, {
          question: this.mapQuestion(event.question),
          questionNumber: event.questionNumber,
          totalQuestions: event.totalQuestions,
          timeLeft: event.timeLeft,
        });
        return;
      case 'game-ended':
        this.emitTo(event.pin, event.type, { leaderboard: event.leaderboard });
        return;
      case 'answer-acknowledged':
        this.emitTo(event.connectionId, event.type, { acknowledged: true });
        return;
      case 'answer-result':
        this.emitTo(event.connectionId, event.type, event.result);
        return;
      case 'leaderboard-updated':
        this.emitTo(event.pin, event.type, { leaderboard: event.leaderboard });
        return;
      case 'game-state':
        this.emitTo(event.connectionId, event.type, {
          question: this.mapQuestion(event.question),
          questionNumber: event.questionNumber,
          totalQuestions: event.totalQuestions,
          timeLeft: event.timeLeft,
        });
        return;
    }
  }

  private mapQuestion(question: Question): SocketQuestionPayload {
    return {
      id: question.id,
      quiz_id: question.quizId,
      question_text: question.questionText,
      type: question.type,
      correct_answer: question.correctAnswer,
      option_a: question.optionA,
      option_b: question.optionB,
      option_c: question.optionC,
      option_d: question.optionD,
      time_limit: question.timeLimit,
      points: question.points,
    };
  }

  private mapPlayer(player: PlayerState, sessionId: number): SocketPlayerPayload {
    return {
      id: player.userId,
      guestId: player.guestId,
      username: player.username,
      avatar: buildSessionPlayerAvatarUrl(sessionId, player.avatarSeed),
      isGuest: player.isGuest,
    };
  }
}
