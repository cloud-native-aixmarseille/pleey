import { Inject, Logger, UseFilters } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  type OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import type { Socket } from 'socket.io';
import { JoinGameDto } from '../../../../../application/game-session/live/player/dto/join-game-dto';
import { SubmitGameActionDto } from '../../../../../application/game-session/live/player/dto/submit-game-action-dto';
import { JoinGameUseCase } from '../../../../../application/game-session/live/player/use-cases/join-game-use-case';
import { RemoveDisconnectedPlayerUseCase } from '../../../../../application/game-session/live/player/use-cases/remove-disconnected-player-use-case';
import { SubmitActionUseCase } from '../../../../../application/game-session/live/player/use-cases/submit-action-use-case';
import type { GameSessionPin } from '../../../../../domain/game/entities/game-session';
import { I18nWsExceptionFilter } from '../../../../shared/error-handling/i18n-ws-exception-filter';
import { BaseGameGateway } from '../../shared/realtime/base-game-gateway';
import { GAME_SOCKET_INBOUND_EVENT } from '../../shared/realtime/game-socket-events';
import { AvatarUriService } from '../../shared/realtime/services/avatar-uri-service';

enum JoinGameAcknowledgementStatus {
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

interface JoinGameAcknowledgement {
  readonly status: JoinGameAcknowledgementStatus.ACCEPTED;
  readonly avatarUri: string | null;
}

interface JoinGameRejectionAcknowledgement {
  readonly status: JoinGameAcknowledgementStatus.REJECTED;
  readonly errorCode: string;
}

@UseFilters(I18nWsExceptionFilter)
@WebSocketGateway()
export class PlayerGameGateway extends BaseGameGateway implements OnGatewayDisconnect {
  constructor(
    @Inject(Logger) logger: Logger,
    private readonly removeDisconnectedPlayerUseCase: RemoveDisconnectedPlayerUseCase,
    private readonly joinGameUseCase: JoinGameUseCase,
    private readonly submitActionUseCase: SubmitActionUseCase,
    private readonly avatarUriService: AvatarUriService,
  ) {
    super(logger);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    this.logger.debug(`Client disconnected: ${client.id}`, PlayerGameGateway.name);
    await this.removeDisconnectedPlayerUseCase.execute(client.id);
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.JOIN_GAME)
  async handleJoinGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<JoinGameAcknowledgement | JoinGameRejectionAcknowledgement> {
    try {
      const dto = await this.validatePayload(JoinGameDto, payload);
      const authenticatedUserId =
        dto.userId !== undefined ? this.getAuthenticatedUserId(client) : undefined;
      const resolvedDto = {
        ...dto,
        userId: authenticatedUserId,
      } satisfies JoinGameDto;

      client.join(resolvedDto.pin);

      await this.joinGameUseCase.execute(client.id, resolvedDto);

      return {
        status: JoinGameAcknowledgementStatus.ACCEPTED,
        avatarUri: resolvedDto.userId
          ? this.avatarUriService.buildUserAvatarUri(resolvedDto.userId)
          : resolvedDto.guestId
            ? this.avatarUriService.buildGuestPlayerAvatarUri(resolvedDto.guestId)
            : null,
      };
    } catch (error) {
      try {
        const maybePin = (payload as { pin?: GameSessionPin } | null)?.pin;
        if (typeof maybePin === 'string' && maybePin.length > 0) {
          client.leave(maybePin);
        }
      } catch {
        // ignore
      }
      this.handleError(client, error, PlayerGameGateway.name);

      return {
        status: JoinGameAcknowledgementStatus.REJECTED,
        errorCode: error instanceof Error ? error.message : 'UNKNOWN',
      };
    }
  }

  @SubscribeMessage(GAME_SOCKET_INBOUND_EVENT.SUBMIT_ACTION)
  async handleSubmitAction(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: unknown,
  ): Promise<void> {
    try {
      const dto = await this.validatePayload(SubmitGameActionDto, payload);
      await this.submitActionUseCase.execute(dto, client.id);
    } catch (error) {
      this.handleError(client, error, PlayerGameGateway.name);
    }
  }
}
