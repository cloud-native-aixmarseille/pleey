import { Logger } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import type { Socket } from 'socket.io';
import type { UserId } from '../../../../../domain/auth/entities/user';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { GAME_SOCKET_OUTBOUND_EVENT } from './game-socket-events';

interface SocketAuthenticatedUser {
  readonly id: UserId;
}

export abstract class BaseGameGateway {
  protected constructor(protected readonly logger: Logger) {}

  protected async validatePayload<T>(dtoClass: new () => T, payload: unknown): Promise<T> {
    const dto = plainToInstance(dtoClass, payload);
    const errors = await validate(dto as object);

    if (errors.length > 0) {
      const errorMessage =
        Object.values(errors[0].constraints ?? {})[0] ?? GameErrorCode.VALIDATION_FAILED;
      throw new WsException(errorMessage);
    }

    return dto;
  }

  protected getAuthenticatedUserId(client: Socket): UserId {
    const user = client.data.user as SocketAuthenticatedUser | undefined;

    if (!user || typeof user.id !== 'number') {
      throw new WsException(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
    }

    return user.id;
  }

  protected handleError(client: Socket, error: unknown, gatewayName: string): void {
    let message: string = GameErrorCode.UNKNOWN_ERROR;

    if (error instanceof WsException) {
      const wsError = error.getError();
      if (typeof wsError === 'string') {
        message = wsError;
      } else if (typeof wsError === 'object' && wsError !== null) {
        const maybeMessage = (wsError as { message?: string }).message;
        message = maybeMessage ?? GameErrorCode.UNKNOWN_ERROR;
      }
    } else if (error instanceof Error && error.message) {
      message = error.message;
    }

    const logMessage = error instanceof Error ? error.message : String(message);
    this.logger.error(`Socket error: ${logMessage}`, undefined, gatewayName);
    client.emit(GAME_SOCKET_OUTBOUND_EVENT.ERROR, { message });
  }
}
