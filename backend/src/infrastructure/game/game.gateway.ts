import process from 'node:process';
import { Inject, Logger, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { Server, Socket } from 'socket.io';
import { I18nService } from 'nestjs-i18n';
import { SubmitAnswerUseCase } from '../../application/game/use-cases/submit-answer.use-case';
import { GetLeaderboardUseCase } from '../../application/game/use-cases/get-leaderboard.use-case';
import { JoinGameDto } from '../../application/game/dto/join-game.dto';
import { SubmitAnswerDto } from '../../application/game/dto/submit-answer.dto';
import { GamePinDto } from '../../application/game/dto/game-pin.dto';
import { AdminGameControlDto } from '../../application/game/dto/admin-game-control.dto';
import type { Question } from '../../domain/quiz/entities/question.entity';
import {
  GameSessionRepositoryProvider,
  type GameSessionRepository,
} from '../../domain/game/repositories/game-session.repository.interface';
import {
  QuestionRepositoryProvider,
  type QuestionRepository,
} from '../../domain/quiz/repositories/question.repository.interface';
import { GameErrorCode } from '../../application/game/enums/game-error-code.enum';
import { I18nWsExceptionFilter } from '../filters/i18n-ws-exception.filter';
import { buildSessionPlayerAvatarUrl } from '../../application/shared/utils/avatar-url.util';

const RAW_SOCKET_ORIGINS = process.env.CORS_ORIGIN ?? '';
const PARSED_SOCKET_ORIGINS = RAW_SOCKET_ORIGINS.split(',')
  .map((origin: string) => origin.trim())
  .filter((origin: string) => origin.length > 0);
const SOCKET_ORIGINS = PARSED_SOCKET_ORIGINS.length > 0
  ? PARSED_SOCKET_ORIGINS
  : ['http://localhost:5173'];
const SOCKET_ALLOW_WILDCARD = SOCKET_ORIGINS.includes('*');

interface PlayerState {
  userId?: number; // Present for authenticated users
  guestId?: string; // Present for guest players
  username: string;
  socketId: string;
  avatarSeed: string;
  isGuest: boolean;
}

interface PlayerScore {
  playerId: string; // userId or guestId
  username: string;
  totalPoints: number;
  isGuest: boolean;
}

interface PlayerAnswer {
  playerId: string;
  answer: string;
  isCorrect: boolean;
  points: number;
  timeLeft: number;
}

interface SessionState {
  sessionId: number;
  quizId: number;
  players: Map<string, PlayerState>;
  scores: Map<string, PlayerScore>; // Track scores in memory
  questions: Question[];
  currentQuestionIndex: number;
  currentQuestionAnswers: Map<string, PlayerAnswer>; // Track answers for current question
  answerRevealTimer?: NodeJS.Timeout; // Timer to auto-reveal answers
}

@UseFilters(I18nWsExceptionFilter)
@WebSocketGateway({
  cors: SOCKET_ALLOW_WILDCARD
    ? {
      origin: '*',
      credentials: false,
    }
    : {
      origin: SOCKET_ORIGINS,
      credentials: true,
    },
})
export class GameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(GameGateway.name);
  private readonly sessions = new Map<string, SessionState>();

  constructor(
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(QuestionRepositoryProvider)
    private readonly questionRepository: QuestionRepository,
    private readonly submitAnswerUseCase: SubmitAnswerUseCase,
    private readonly getLeaderboardUseCase: GetLeaderboardUseCase,
    private readonly i18n: I18nService,
  ) { }

  afterInit(): void {
    this.logger.log('GameGateway initialized');
  }

  handleConnection(client: Socket): void {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Client disconnected: ${client.id}`);

    for (const [pin, state] of this.sessions) {
      if (state.players.delete(client.id)) {
        if (state.players.size === 0 && state.currentQuestionIndex >= state.questions.length) {
          this.sessions.delete(pin);
        } else {
          this.server.to(pin).emit('player-joined', {
            players: this.mapPlayers(state),
          });
        }
        break;
      }
    }
  }

  @SubscribeMessage('join-game')
  async handleJoinGame(@ConnectedSocket() client: Socket, @MessageBody() payload: unknown): Promise<void> {
    try {
      const dto = await this.validatePayload(JoinGameDto, payload);
      const state = await this.ensureSessionState(dto.pin);

      // Validate that exactly one of userId or guestId is provided
      const hasUserId = dto.userId !== undefined && dto.userId !== null;
      const hasGuestId = dto.guestId !== undefined && dto.guestId !== null && dto.guestId.trim() !== '';

      if (hasUserId && hasGuestId) {
        throw new WsException('Cannot provide both userId and guestId');
      }

      // Determine if this is a guest or authenticated user
      const isGuest = !hasUserId;
      let guestId = dto.guestId;

      // Generate guestId if not provided for guest players
      if (isGuest && !hasGuestId) {
        guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      }

      // Find existing player by userId or guestId
      const existingEntry = isGuest
        ? this.findPlayerByGuestId(state.players, guestId!)
        : this.findPlayerByUserId(state.players, dto.userId!);

      // Generate avatar seed based on player type
      const avatarSeed = isGuest ? guestId! : `${dto.userId}`;
      const resolvedAvatarSeed = existingEntry?.avatarSeed ?? avatarSeed;

      if (existingEntry) {
        state.players.delete(existingEntry.socketId);
      }

      state.players.set(client.id, {
        socketId: client.id,
        userId: dto.userId,
        guestId: isGuest ? guestId : undefined,
        username: dto.username,
        avatarSeed: resolvedAvatarSeed,
        isGuest,
      });

      client.join(dto.pin);

      this.server.to(dto.pin).emit('player-joined', {
        players: this.mapPlayers(state),
      });
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage('start-game')
  async handleStartGame(@ConnectedSocket() client: Socket, @MessageBody() payload: unknown): Promise<void> {
    try {
      const dto = await this.validatePayload(GamePinDto, payload);
      const state = await this.ensureSessionState(dto.pin);
      const session = await this.gameSessionRepository.findByPin(dto.pin);

      if (!session) {
        throw new WsException(GameErrorCode.GAME_NOT_FOUND);
      }

      if (!state.questions.length) {
        throw new WsException(GameErrorCode.NO_QUESTIONS_AVAILABLE);
      }

      state.currentQuestionIndex = 0;
      await this.gameSessionRepository.updateStatus(state.sessionId, 'active');
      await this.gameSessionRepository.updateCurrentQuestion(state.sessionId, 0);

      // Reset answer tracking for new question
      state.currentQuestionAnswers.clear();
      if (state.answerRevealTimer) {
        clearTimeout(state.answerRevealTimer);
      }

      const currentQuestion = state.questions[0];

      // Set up timer to auto-reveal answers when time expires
      state.answerRevealTimer = setTimeout(() => {
        this.revealAnswers(dto.pin, state);
      }, currentQuestion.timeLimit * 1000);

      this.server.to(dto.pin).emit('game-started', {
        question: this.mapQuestion(currentQuestion),
        questionNumber: 1,
        totalQuestions: state.questions.length,
      });
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage('submit-answer')
  async handleSubmitAnswer(@ConnectedSocket() client: Socket, @MessageBody() payload: unknown): Promise<void> {
    try {
      const dto = await this.validatePayload(SubmitAnswerDto, payload);
      const state = await this.ensureSessionState(dto.pin);

      // Validate that exactly one of userId or guestId is provided
      const hasUserId = dto.userId !== undefined && dto.userId !== null;
      const hasGuestId = dto.guestId !== undefined && dto.guestId !== null && dto.guestId.trim() !== '';

      if (!hasUserId && !hasGuestId) {
        throw new WsException('Must provide either userId or guestId');
      }

      if (hasUserId && hasGuestId) {
        throw new WsException('Cannot provide both userId and guestId');
      }

      const playerId = this.createPlayerId(dto.userId, dto.guestId);

      // Check if player already answered this question
      if (state.currentQuestionAnswers.has(playerId)) {
        throw new WsException('You have already answered this question');
      }

      const result = await this.submitAnswerUseCase.execute(dto);

      // Update in-memory scores
      const player = Array.from(state.players.values()).find(p =>
        (dto.userId && p.userId === dto.userId) || (dto.guestId && p.guestId === dto.guestId)
      );

      if (player) {
        const existingScore = state.scores.get(playerId);
        const totalPoints = (existingScore?.totalPoints ?? 0) + result.points;

        state.scores.set(playerId, {
          playerId,
          username: player.username,
          totalPoints,
          isGuest: player.isGuest,
        });
      }

      // Store the answer without revealing it yet
      state.currentQuestionAnswers.set(playerId, {
        playerId,
        answer: dto.answer,
        isCorrect: result.isCorrect,
        points: result.points,
        timeLeft: dto.timeLeft,
      });

      // Acknowledge answer submission without revealing correctness
      client.emit('answer-submitted', {
        acknowledged: true,
      });

      // Check if all players have answered
      const totalPlayers = state.players.size;
      const answeredPlayers = state.currentQuestionAnswers.size;

      if (answeredPlayers === totalPlayers) {
        // All players have answered, reveal answers immediately
        this.revealAnswers(dto.pin, state);
      }
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage('next-question')
  async handleNextQuestion(@ConnectedSocket() client: Socket, @MessageBody() payload: unknown): Promise<void> {
    try {
      const dto = await this.validatePayload(GamePinDto, payload);
      const state = await this.ensureSessionState(dto.pin);

      if (state.currentQuestionIndex + 1 >= state.questions.length) {
        await this.endGame(dto.pin, state);
        return;
      }

      state.currentQuestionIndex += 1;
      await this.gameSessionRepository.updateCurrentQuestion(
        state.sessionId,
        state.currentQuestionIndex,
      );

      // Reset answer tracking for new question
      state.currentQuestionAnswers.clear();
      if (state.answerRevealTimer) {
        clearTimeout(state.answerRevealTimer);
      }

      const nextQuestion = state.questions[state.currentQuestionIndex];

      // Set up timer to auto-reveal answers when time expires
      state.answerRevealTimer = setTimeout(() => {
        this.revealAnswers(dto.pin, state);
      }, nextQuestion.timeLimit * 1000);

      this.server.to(dto.pin).emit('next-question', {
        question: this.mapQuestion(nextQuestion),
        questionNumber: state.currentQuestionIndex + 1,
      });
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage('stop-game')
  async handleStopGame(@ConnectedSocket() client: Socket, @MessageBody() payload: unknown): Promise<void> {
    try {
      const dto = await this.validatePayload(AdminGameControlDto, payload);
      const state = await this.ensureSessionState(dto.pin);
      const session = await this.gameSessionRepository.findByPin(dto.pin);

      if (!session) {
        throw new WsException(GameErrorCode.GAME_NOT_FOUND);
      }

      // Verify admin ownership
      if (session.adminId !== dto.adminId) {
        throw new WsException(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
      }

      // Clear timer when pausing
      if (state.answerRevealTimer) {
        clearTimeout(state.answerRevealTimer);
        state.answerRevealTimer = undefined;
      }

      await this.gameSessionRepository.updateStatus(session.id, 'paused');

      const message = await this.i18n.translate('game.errors.gamePaused');
      this.server.to(dto.pin).emit('game-paused', {
        message,
      });
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage('resume-game')
  async handleResumeGame(@ConnectedSocket() client: Socket, @MessageBody() payload: unknown): Promise<void> {
    try {
      const dto = await this.validatePayload(AdminGameControlDto, payload);
      const state = await this.ensureSessionState(dto.pin);
      const session = await this.gameSessionRepository.findByPin(dto.pin);

      if (!session) {
        throw new WsException(GameErrorCode.GAME_NOT_FOUND);
      }

      // Verify admin ownership
      if (session.adminId !== dto.adminId) {
        throw new WsException(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
      }

      await this.gameSessionRepository.updateStatus(session.id, 'active');

      // Emit current question to resume the game
      const currentQuestion = state.questions[state.currentQuestionIndex];
      this.server.to(dto.pin).emit('game-resumed', {
        question: this.mapQuestion(currentQuestion),
        questionNumber: state.currentQuestionIndex + 1,
        totalQuestions: state.questions.length,
      });
    } catch (error) {
      this.handleError(client, error);
    }
  }


  private async ensureSessionState(pin: string): Promise<SessionState> {
    let state = this.sessions.get(pin);

    if (state) {
      return state;
    }

    const session = await this.gameSessionRepository.findByPin(pin);

    if (!session) {
      throw new WsException(GameErrorCode.GAME_NOT_FOUND);
    }

    const questions = await this.questionRepository.findByQuizId(session.quizId);

    state = {
      sessionId: session.id,
      quizId: session.quizId,
      players: new Map(),
      scores: new Map(),
      questions,
      currentQuestionIndex: session.currentQuestion ?? 0,
      currentQuestionAnswers: new Map(),
    };

    this.sessions.set(pin, state);
    return state;
  }

  private revealAnswers(pin: string, state: SessionState): void {
    // Clear any existing timer
    if (state.answerRevealTimer) {
      clearTimeout(state.answerRevealTimer);
      state.answerRevealTimer = undefined;
    }

    const currentQuestion = state.questions[state.currentQuestionIndex];

    // Calculate answer statistics
    const answerDistribution: Record<string, number> = {};
    for (const playerAnswer of state.currentQuestionAnswers.values()) {
      answerDistribution[playerAnswer.answer] = (answerDistribution[playerAnswer.answer] || 0) + 1;
    }

    // Send individual results to each player
    for (const [socketId, player] of state.players.entries()) {
      const playerId = this.createPlayerId(player.userId, player.guestId);
      const playerAnswer = state.currentQuestionAnswers.get(playerId);

      if (playerAnswer) {
        // Player answered - send their result
        this.server.to(socketId).emit('answer-result', {
          isCorrect: playerAnswer.isCorrect,
          points: playerAnswer.points,
          correctAnswer: currentQuestion.correctAnswer,
          statistics: {
            totalAnswers: state.currentQuestionAnswers.size,
            answerDistribution,
          },
        });
      } else {
        // Player didn't answer - send correct answer with no points
        this.server.to(socketId).emit('answer-result', {
          isCorrect: false,
          points: 0,
          correctAnswer: currentQuestion.correctAnswer,
          statistics: {
            totalAnswers: state.currentQuestionAnswers.size,
            answerDistribution,
          },
        });
      }
    }

    // Broadcast updated leaderboard
    this.broadcastLeaderboard(pin, state);
  }

  private async broadcastLeaderboard(pin: string, state: SessionState): Promise<void> {
    // Get in-memory scores (includes both guests and authenticated users)
    const scores = Array.from(state.scores.values());

    // Sort by totalPoints descending
    scores.sort((a, b) => b.totalPoints - a.totalPoints);

    const formatted = scores.map((entry, index) => {
      return {
        userId: this.extractUserIdFromPlayerId(entry.playerId),
        guestId: this.extractGuestIdFromPlayerId(entry.playerId),
        username: entry.username,
        totalPoints: entry.totalPoints,
        rank: index + 1,
        isGuest: entry.isGuest,
      };
    });

    this.server.to(pin).emit('leaderboard-updated', {
      leaderboard: formatted,
    });
  }

  private async endGame(pin: string, state: SessionState): Promise<void> {
    // Clear timer when ending game
    if (state.answerRevealTimer) {
      clearTimeout(state.answerRevealTimer);
      state.answerRevealTimer = undefined;
    }

    await this.gameSessionRepository.updateStatus(state.sessionId, 'ended');

    // Get in-memory scores for final leaderboard
    const scores = Array.from(state.scores.values());
    scores.sort((a, b) => b.totalPoints - a.totalPoints);

    const formatted = scores.map((entry, index) => {
      return {
        userId: this.extractUserIdFromPlayerId(entry.playerId),
        guestId: this.extractGuestIdFromPlayerId(entry.playerId),
        username: entry.username,
        totalPoints: entry.totalPoints,
        rank: index + 1,
        isGuest: entry.isGuest,
      };
    });

    this.server.to(pin).emit('game-ended', { leaderboard: formatted });
    this.sessions.delete(pin);
  }

  private mapPlayers(state: SessionState): Array<{
    id?: number;
    guestId?: string;
    username: string;
    avatar: string;
    isGuest: boolean;
  }> {
    return Array.from(state.players.values()).map((player) => ({
      id: player.userId,
      guestId: player.guestId,
      username: player.username,
      avatar: buildSessionPlayerAvatarUrl(state.sessionId, player.avatarSeed),
      isGuest: player.isGuest,
    }));
  }

  private createPlayerId(userId?: number, guestId?: string): string {
    if (userId !== undefined && userId !== null) {
      return `user-${userId}`;
    }
    if (guestId) {
      return `guest-${guestId}`;
    }
    throw new Error('Must provide either userId or guestId');
  }

  private extractUserIdFromPlayerId(playerId: string): number | undefined {
    if (playerId.startsWith('user-')) {
      return Number.parseInt(playerId.substring(5), 10);
    }
    return undefined;
  }

  private extractGuestIdFromPlayerId(playerId: string): string | undefined {
    if (playerId.startsWith('guest-')) {
      return playerId.substring(6);
    }
    return undefined;
  }

  private mapQuestion(question: Question): Record<string, unknown> {
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

  private findPlayerByUserId(players: Map<string, PlayerState>, userId: number): PlayerState | null {
    for (const player of players.values()) {
      if (player.userId === userId) {
        return player;
      }
    }

    return null;
  }

  private findPlayerByGuestId(players: Map<string, PlayerState>, guestId: string): PlayerState | null {
    for (const player of players.values()) {
      if (player.guestId === guestId) {
        return player;
      }
    }

    return null;
  }

  private async validatePayload<T>(dtoClass: new () => T, payload: unknown): Promise<T> {
    const dto = plainToInstance(dtoClass, payload);
    const errors = await validate(dto as object);

    if (errors.length > 0) {
      const errorMessage = Object.values(errors[0].constraints ?? {})[0] ?? GameErrorCode.VALIDATION_FAILED;
      throw new WsException(errorMessage);
    }

    return dto;
  }

  private handleError(client: Socket, error: unknown): void {
    let message = 'Unknown error';

    if (error instanceof WsException) {
      const exception = error as WsException;
      const wsError = exception.getError();
      if (typeof wsError === 'string') {
        message = wsError;
      } else if (typeof wsError === 'object' && wsError !== null) {
        const maybeMessage = (wsError as { message?: string }).message;
        message = maybeMessage ?? 'Unknown error';
      }
    } else if (error instanceof Error) {
      message = error.message;
    }

    this.logger.error(`Socket error: ${message}`);
    client.emit('error', { message });
  }
}
