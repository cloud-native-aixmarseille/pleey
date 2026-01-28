import { Inject, Logger, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { AdvanceGameStageUseCase } from '../../../../../application/game-session/live/host/use-cases/advance-game-stage-use-case';
import { EndGameUseCase } from '../../../../../application/game-session/live/host/use-cases/end-game-use-case';
import { PauseGameUseCase } from '../../../../../application/game-session/live/host/use-cases/pause-game-use-case';
import { RestartGameStageUseCase } from '../../../../../application/game-session/live/host/use-cases/restart-game-stage-use-case';
import { ResumeGameUseCase } from '../../../../../application/game-session/live/host/use-cases/resume-game-use-case';
import { ReturnGameToLobbyUseCase } from '../../../../../application/game-session/live/host/use-cases/return-game-to-lobby-use-case';
import { RewindGameStageUseCase } from '../../../../../application/game-session/live/host/use-cases/rewind-game-stage-use-case';
import { StartGameUseCase } from '../../../../../application/game-session/live/host/use-cases/start-game-use-case';
import { I18nWsExceptionFilter } from '../../../../shared/error-handling/i18n-ws-exception-filter';
import { BaseGameGateway } from '../../shared/realtime/base-game-gateway';
import { GamePinDto } from '../../shared/realtime/dto/game-pin-dto';
import { GAME_SOCKET_INBOUND_EVENT } from '../../shared/realtime/game-socket-events';

@UseFilters(I18nWsExceptionFilter)
@WebSocketGateway()
export class HostGameGateway extends BaseGameGateway {
  constructor(
    @Inject(Logger) logger: Logger,
    private readonly startGameUseCase: StartGameUseCase,
    private readonly advanceGameStageUseCase: AdvanceGameStageUseCase,
    private readonly restartGameStageUseCase: RestartGameStageUseCase,
    private readonly rewindGameStageUseCase: RewindGameStageUseCase,
    private readonly returnGameToLobbyUseCase: ReturnGameToLobbyUseCase,
    private readonly pauseGameUseCase: PauseGameUseCase,
    private readonly resumeGameUseCase: ResumeGameUseCase,
    private readonly endGameUseCase: EndGameUseCase,
  ) {
    super(logger);
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.START_GAME)
  async handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(GamePinDto, payload);
      const hostId = this.getAuthenticatedUserId(client);
      await this.startGameUseCase.execute(dto.pin, hostId);
    } catch (error) {
      this.handleError(client, error, HostGameGateway.name);
    }
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.NEXT_STAGE)
  async handleNextStage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(GamePinDto, payload);
      const hostId = this.getAuthenticatedUserId(client);
      await this.advanceGameStageUseCase.execute(dto.pin, hostId);
    } catch (error) {
      this.handleError(client, error, HostGameGateway.name);
    }
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.RESTART_STAGE)
  async handleRestartStage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(GamePinDto, payload);
      const hostId = this.getAuthenticatedUserId(client);
      await this.restartGameStageUseCase.execute(dto.pin, hostId);
    } catch (error) {
      this.handleError(client, error, HostGameGateway.name);
    }
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.PREVIOUS_STAGE)
  async handlePreviousStage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(GamePinDto, payload);
      const hostId = this.getAuthenticatedUserId(client);
      await this.rewindGameStageUseCase.execute(dto.pin, hostId);
    } catch (error) {
      this.handleError(client, error, HostGameGateway.name);
    }
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.RETURN_TO_LOBBY)
  async handleReturnToLobby(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(GamePinDto, payload);
      const hostId = this.getAuthenticatedUserId(client);
      await this.returnGameToLobbyUseCase.execute(dto.pin, hostId);
    } catch (error) {
      this.handleError(client, error, HostGameGateway.name);
    }
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.STOP_GAME)
  async handleStopGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(GamePinDto, payload);
      const hostId = this.getAuthenticatedUserId(client);
      await this.pauseGameUseCase.execute(dto.pin, hostId);
    } catch (error) {
      this.handleError(client, error, HostGameGateway.name);
    }
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.RESUME_GAME)
  async handleResumeGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(GamePinDto, payload);
      const hostId = this.getAuthenticatedUserId(client);
      await this.resumeGameUseCase.execute(dto.pin, hostId);
    } catch (error) {
      this.handleError(client, error, HostGameGateway.name);
    }
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.END_GAME)
  async handleEndGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(GamePinDto, payload);
      const hostId = this.getAuthenticatedUserId(client);
      await this.endGameUseCase.execute({ pin: dto.pin, hostId });
    } catch (error) {
      this.handleError(client, error, HostGameGateway.name);
    }
  }
}
