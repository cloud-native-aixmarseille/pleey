import { inject, injectable } from 'inversify';
import type {
  GameSessionJoinRuntimePort,
  JoinGameDispatchCommand,
  JoinGameDispatchReceipt,
} from '../../../application/game-session/live/player/ports/game-session-join-runtime.port';
import { SocketIoGameSessionConnection } from './socket-io-game-session-connection';

@injectable()
export class SocketIoGameSessionJoinRuntime implements GameSessionJoinRuntimePort {
  constructor(
    @inject(SocketIoGameSessionConnection)
    private readonly connection: SocketIoGameSessionConnection,
  ) {}

  joinGame(command: JoinGameDispatchCommand): void {
    this.connection.emit('join-game', {
      pin: command.pin,
      username: command.username,
      userId: command.userId,
      guestId: command.guestId,
    });
  }

  joinGameWithReceipt(command: JoinGameDispatchCommand): Promise<JoinGameDispatchReceipt> {
    return this.connection.emitWithAck('join-game', {
      pin: command.pin,
      username: command.username,
      userId: command.userId,
      guestId: command.guestId,
    });
  }
}
