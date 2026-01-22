import { Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSession } from '../../../domain/game/entities/game-session';
import type { GameSessionState } from '../../../domain/game/entities/game-session-state';
import type { GuestId } from '../../../domain/game/entities/player-state';
import { PlayerState } from '../../../domain/game/entities/player-state';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/ports/game-session.repository';
import { calculateAnswerDistribution } from '../../../domain/game/services/answer-distribution.util';
import { GameSessionStateService } from '../../../domain/game/services/game-session-state.service';
import type { Question } from '../../../domain/quiz/entities/question';
import type { JoinGameDto } from '../dto/join-game.dto';
import {
  type AnswerResultPayload,
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
} from '../ports';

type PlayerIdentity = { guestId: GuestId } | { userId: UserId };

@Injectable()
export class JoinGameWsUseCase {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
  ) {}

  async execute(socketId: string, dto: JoinGameDto): Promise<void> {
    const state = await this.gameSessionStateService.getOrCreate(dto.pin);

    const identity = this.validatePlayerIdentity(dto);

    const player = this.createPlayerState(socketId, dto.username, identity, state);
    state.addPlayer(player);
    await this.gameSessionStateService.update(dto.pin, state);

    this.broadcastService.publish({
      type: GameBroadcastEventType.PLAYER_JOINED,
      pin: dto.pin,
      sessionId: state.sessionId,
      players: state.getNonHostPlayers(),
    });

    const session = await this.gameSessionRepository.findByPin(dto.pin);

    await this.handlePlayerRejoin(socketId, dto, state, session);

    // Publish pause state after potential admin game-state hydration,
    // so clients end up with isPaused=true.
    if (session?.status === GameSessionStatus.PAUSED && state.hasQuestions) {
      const currentQuestion = state.currentQuestion;
      const fallbackTimeLeft = currentQuestion?.timeLimit ?? 20;
      const timeLeft = state.pausedTimeLeft ?? fallbackTimeLeft;

      this.broadcastService.publish({
        type: GameBroadcastEventType.GAME_PAUSED,
        pin: dto.pin,
        timeLeft,
      });
    }
  }

  private validatePlayerIdentity(dto: JoinGameDto): PlayerIdentity {
    const hasUserId = dto.userId !== undefined && dto.userId !== null;
    const hasGuestId =
      dto.guestId !== undefined && dto.guestId !== null && dto.guestId.trim() !== '';

    if (hasUserId && hasGuestId) {
      throw new WsException(GameErrorCode.VALIDATION_FAILED);
    }

    if (hasUserId) {
      const userId = dto.userId;
      if (userId === undefined || userId === null) {
        throw new WsException(GameErrorCode.VALIDATION_FAILED);
      }
      return { userId };
    }

    if (hasGuestId) {
      const guestId = dto.guestId;
      if (guestId === undefined || guestId === null || guestId.trim() === '') {
        throw new WsException(GameErrorCode.VALIDATION_FAILED);
      }
      return { guestId };
    }

    return {
      guestId: `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}` as GuestId,
    };
  }

  private createPlayerState(
    socketId: string,
    username: string,
    identity: PlayerIdentity,
    state: GameSessionState,
  ): PlayerState {
    if ('guestId' in identity) {
      const existingPlayer = state.findPlayerByGuestId(identity.guestId);
      const avatarSeed = existingPlayer?.avatarSeed ?? identity.guestId;
      return PlayerState.createGuest(socketId, identity.guestId, username, avatarSeed);
    }

    const existingPlayer = state.findPlayerByUserId(identity.userId);
    const avatarSeed = existingPlayer?.avatarSeed ?? `${identity.userId}`;
    return PlayerState.createAuthenticated(socketId, identity.userId, username, avatarSeed);
  }

  private async handlePlayerRejoin(
    socketId: string,
    dto: JoinGameDto,
    state: GameSessionState,
    session: GameSession | null,
  ): Promise<void> {
    if (
      !session ||
      ![GameSessionStatus.ACTIVE, GameSessionStatus.PAUSED].includes(session.status) ||
      !state.hasQuestions
    ) {
      return;
    }

    const currentQuestion = state.currentQuestion;
    if (!currentQuestion) {
      return;
    }

    const timeLeft = this.resolveTimeLeft(state, currentQuestion.timeLimit);

    this.broadcastService.publish({
      type: GameBroadcastEventType.GAME_STATE,
      connectionId: socketId,
      question: currentQuestion,
      totalQuestions: state.totalQuestions,
      timeLeft,
    });

    if (timeLeft > 0) {
      return;
    }

    const player = this.findJoiningPlayer(state, dto);
    if (!player) {
      return;
    }

    const answerResult = this.buildAnswerResultPayload(state, currentQuestion, player);
    if (!answerResult) {
      return;
    }

    this.broadcastService.publish({
      type: GameBroadcastEventType.ANSWER_RESULT,
      connectionId: socketId,
      result: answerResult,
    });
  }

  private resolveTimeLeft(state: GameSessionState, timeLimit: number): number {
    if (typeof state.pausedTimeLeft === 'number') {
      return state.pausedTimeLeft;
    }

    if (!state.questionStartTime) {
      return timeLimit;
    }

    const elapsedSeconds = Math.floor((Date.now() - state.questionStartTime) / 1000);
    return Math.max(0, timeLimit - elapsedSeconds);
  }

  private buildAnswerResultPayload(
    state: GameSessionState,
    currentQuestion: Question,
    player: PlayerState,
  ): AnswerResultPayload | null {
    const answers = state.getAllAnswers();
    const statistics = {
      totalAnswers: state.answeredCount,
      answerDistribution: calculateAnswerDistribution(answers),
    };
    const playerAnswer = state.getAnswer(player.playerId);

    return {
      isCorrect: playerAnswer?.isCorrect ?? false,
      points: playerAnswer?.points ?? 0,
      correctAnswerIds: currentQuestion.getCorrectAnswers().map((answer) => answer.id),
      statistics,
    };
  }

  private findJoiningPlayer(state: GameSessionState, dto: JoinGameDto): PlayerState | undefined {
    if (dto.userId !== undefined && dto.userId !== null) {
      return state.findPlayerByUserId(dto.userId);
    }

    if (dto.guestId) {
      return state.findPlayerByGuestId(dto.guestId);
    }

    return undefined;
  }
}
