import { Inject, Logger, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayConnection,
  type OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import type { GameSessionState } from '../../../../../domain/game/entities/game-session-state';
import { GameSessionStatus } from '../../../../../domain/game/enums/game-session-status.enum';
import {
  type GameRepository,
  GameRepositoryProvider,
} from '../../../../../domain/game/ports/repositories/game.repository';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../../../domain/game/ports/repositories/game-session.repository';
import { GameBroadcastEventType } from '../../../../../domain/game/ports/services/game-broadcast.service';
import { GameSessionStateService } from '../../../../../domain/game/services/game-session-state-service';
import { I18nWsExceptionFilter } from '../../../../shared/error-handling/i18n-ws-exception-filter';
import { BaseGameGateway } from './base-game-gateway';
import { GamePinDto } from './dto/game-pin-dto';
import { GAME_SOCKET_INBOUND_EVENT } from './game-socket-events';
import { SOCKET_OUTBOUND_EVENT_BY_TYPE } from './services/socket-game-broadcast-events';
import { SocketGameBroadcastMessageMapper } from './services/socket-game-broadcast-message-mapper';
import { SocketGameBroadcastService } from './services/socket-game-broadcast-service';

@UseFilters(I18nWsExceptionFilter)
@WebSocketGateway()
export class GameSessionObserverGateway
  extends BaseGameGateway
  implements OnGatewayInit, OnGatewayConnection
{
  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(Logger) logger: Logger,
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameRepositoryProvider)
    private readonly gameRepository: GameRepository,
    @Inject(SocketGameBroadcastService)
    private readonly broadcastService: SocketGameBroadcastService,
    private readonly messageMapper: SocketGameBroadcastMessageMapper,
  ) {
    super(logger);
  }

  afterInit(server: Server): void {
    this.broadcastService.setServer(server);
    this.logger.log('GameSessionObserverGateway initialized', GameSessionObserverGateway.name);
  }

  handleConnection(client: Socket): void {
    this.logger.debug(`Client connected: ${client.id}`, GameSessionObserverGateway.name);
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.OBSERVE_SESSION)
  async handleObserveSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(GamePinDto, payload);

      client.join(dto.pin);
      await this.emitSessionSnapshot(client, dto.pin);
    } catch (error) {
      this.handleError(client, error, GameSessionObserverGateway.name);
    }
  }

  private async emitSessionSnapshot(client: Socket, pin: string): Promise<void> {
    const session = await this.gameSessionRepository.findByPin(pin);

    if (!session || session.status === GameSessionStatus.ENDED) {
      return;
    }

    const game = await this.gameRepository.findById(session.gameId);

    if (!game) {
      return;
    }

    const state = await this.gameSessionStateService.getOrCreate(pin);

    const playerJoinedMessage = this.messageMapper.map({
      type: GameBroadcastEventType.PLAYER_JOINED,
      pin,
      sessionId: session.id,
      gameTitle: state.gameTitle,
      gameType: state.gameType,
      players: state.getNonHostPlayers(),
    });

    this.server
      .to(client.id)
      .emit(
        SOCKET_OUTBOUND_EVENT_BY_TYPE[GameBroadcastEventType.PLAYER_JOINED],
        playerJoinedMessage.payload,
      );

    if (
      ![GameSessionStatus.ACTIVE, GameSessionStatus.PAUSED].includes(session.status) ||
      !state.currentStage
    ) {
      return;
    }

    const timeLeft = this.resolveTimeLeft(state, state.currentStage.timeLimit);
    const gameStateMessage = this.messageMapper.map({
      type: GameBroadcastEventType.GAME_STATE,
      connectionId: client.id,
      gameTitle: state.gameTitle,
      gameType: state.gameType,
      activePlayerCount: state.getNonHostPlayers().length,
      stage: state.currentStage,
      totalStages: state.totalStages,
      timeLeft,
    });

    this.server
      .to(client.id)
      .emit(
        SOCKET_OUTBOUND_EVENT_BY_TYPE[GameBroadcastEventType.GAME_STATE],
        gameStateMessage.payload,
      );

    if (session.status === GameSessionStatus.PAUSED) {
      this.server
        .to(client.id)
        .emit(SOCKET_OUTBOUND_EVENT_BY_TYPE[GameBroadcastEventType.GAME_PAUSED], { timeLeft });
    }
  }

  private resolveTimeLeft(state: GameSessionState, timeLimit: number): number {
    if (typeof state.pausedTimeLeft === 'number') {
      return state.pausedTimeLeft;
    }

    if (!state.stageStartTime) {
      return timeLimit;
    }

    const elapsedSeconds = Math.floor((Date.now() - state.stageStartTime) / 1000);
    return Math.max(0, timeLimit - elapsedSeconds);
  }
}
