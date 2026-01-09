import process from 'node:process';
import { Inject, Logger, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayDisconnect,
  type OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { Server, Socket } from 'socket.io';
import { GamePinDto } from '../../application/game/dto/game-pin.dto';
import { HostGameControlDto } from '../../application/game/dto/host-game-control.dto';
import { JoinGameDto } from '../../application/game/dto/join-game.dto';
import { SubmitAnswerDto } from '../../application/game/dto/submit-answer.dto';
import { GameErrorCode } from '../../application/game/enums/game-error-code.enum';
import { EndGameUseCase } from '../../application/game/use-cases/end-game.use-case';
import { HandleDisconnectWsUseCase } from '../../application/game/use-cases/handle-disconnect-ws.use-case';
import { JoinGameWsUseCase } from '../../application/game/use-cases/join-game-ws.use-case';
import { NextQuestionWsUseCase } from '../../application/game/use-cases/next-question-ws.use-case';
import { PauseGameWsUseCase } from '../../application/game/use-cases/pause-game-ws.use-case';
import { ResumeGameWsUseCase } from '../../application/game/use-cases/resume-game-ws.use-case';
import { StartGameWsUseCase } from '../../application/game/use-cases/start-game-ws.use-case';
import { SubmitAnswerWsUseCase } from '../../application/game/use-cases/submit-answer-ws.use-case';
import { I18nWsExceptionFilter } from '../shared/filters/i18n-ws-exception.filter';
import { GAME_SOCKET_INBOUND_EVENT, GAME_SOCKET_OUTBOUND_EVENT } from './game-socket-events';
import { SocketGameBroadcastService } from './services/socket-game-broadcast.service';

const RAW_SOCKET_ORIGINS = process.env.CORS_ORIGIN ?? '';
const PARSED_SOCKET_ORIGINS = RAW_SOCKET_ORIGINS.split(',')
  .map((origin: string) => origin.trim())
  .filter((origin: string) => origin.length > 0);
const SOCKET_ORIGINS =
  PARSED_SOCKET_ORIGINS.length > 0 ? PARSED_SOCKET_ORIGINS : ['http://localhost:5173'];
const SOCKET_ALLOW_WILDCARD = SOCKET_ORIGINS.includes('*');

/**
 * WebSocket Gateway for game operations.
 * Follows Single Responsibility Principle - only handles socket protocol concerns.
 * Business logic is delegated to application use-cases.
 */
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
  server!: Server;

  private readonly logger = new Logger(GameGateway.name);

  constructor(
    private readonly handleDisconnectUseCase: HandleDisconnectWsUseCase,
    private readonly joinGameUseCase: JoinGameWsUseCase,
    private readonly startGameUseCase: StartGameWsUseCase,
    private readonly submitAnswerUseCase: SubmitAnswerWsUseCase,
    private readonly nextQuestionUseCase: NextQuestionWsUseCase,
    private readonly pauseGameUseCase: PauseGameWsUseCase,
    private readonly resumeGameUseCase: ResumeGameWsUseCase,
    private readonly endGameUseCase: EndGameUseCase,
    @Inject(SocketGameBroadcastService)
    private readonly broadcastService: SocketGameBroadcastService,
  ) {}

  afterInit(server: Server): void {
    this.broadcastService.setServer(server);
    this.logger.log('GameGateway initialized');
  }

  handleConnection(client: Socket): void {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.debug(`Client disconnected: ${client.id}`);
    await this.handleDisconnectUseCase.execute(client.id);
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.JOIN_GAME)
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(JoinGameDto, payload);

      // Room membership is a transport concern (Socket.IO), keep it at the gateway level.
      client.join(dto.pin);

      await this.joinGameUseCase.execute(client.id, dto);
    } catch (error) {
      // Best-effort cleanup: if we already joined a room, leave it.
      try {
        const maybePin = (payload as { pin?: string } | null)?.pin;
        if (typeof maybePin === 'string' && maybePin.length > 0) {
          client.leave(maybePin);
        }
      } catch {
        // ignore
      }
      this.handleError(client, error);
    }
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.START_GAME)
  async handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(GamePinDto, payload);
      await this.startGameUseCase.execute(dto.pin);
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.SUBMIT_ANSWER)
  async handleSubmitAnswer(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(SubmitAnswerDto, payload);
      await this.submitAnswerUseCase.execute(client.id, dto);
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.NEXT_QUESTION)
  async handleNextQuestion(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(GamePinDto, payload);
      await this.nextQuestionUseCase.execute(dto.pin);
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.STOP_GAME)
  async handleStopGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(HostGameControlDto, payload);
      await this.pauseGameUseCase.execute(dto.pin, dto.hostId);
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.RESUME_GAME)
  async handleResumeGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(HostGameControlDto, payload);
      await this.resumeGameUseCase.execute(dto.pin, dto.hostId);
    } catch (error) {
      this.handleError(client, error);
    }
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.END_GAME)
  async handleEndGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(HostGameControlDto, payload);
      await this.endGameUseCase.execute({ pin: dto.pin, hostId: dto.hostId });
    } catch (error) {
      this.handleError(client, error);
    }
  }

  private async validatePayload<T>(dtoClass: new () => T, payload: unknown): Promise<T> {
    const dto = plainToInstance(dtoClass, payload);
    const errors = await validate(dto as object);

    if (errors.length > 0) {
      const errorMessage =
        Object.values(errors[0].constraints ?? {})[0] ?? GameErrorCode.VALIDATION_FAILED;
      throw new WsException(errorMessage);
    }

    return dto;
  }

  private handleError(client: Socket, error: unknown): void {
    let message: string = GameErrorCode.UNKNOWN_ERROR;

    if (error instanceof WsException) {
      const wsError = error.getError();
      if (typeof wsError === 'string') {
        message = wsError;
      } else if (typeof wsError === 'object' && wsError !== null) {
        const maybeMessage = (wsError as { message?: string }).message;
        message = maybeMessage ?? GameErrorCode.UNKNOWN_ERROR;
      }
    }

    const logMessage = error instanceof Error ? error.message : String(message);
    this.logger.error(`Socket error: ${logMessage}`);
    client.emit(GAME_SOCKET_OUTBOUND_EVENT.ERROR, { message });
  }
}
