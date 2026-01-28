import { inject, injectable } from 'inversify';
import type {
  GameSessionPlayingRuntimeEventKey,
  GameSessionPlayingRuntimeHandler,
  GameSessionPlayingRuntimePort,
  SubmitGameActionCommand,
} from '../../../application/game-session/live/player/ports/game-session-playing-runtime.port';
import { SocketIoGameSessionConnection } from './socket-io-game-session-connection';

@injectable()
export class SocketIoGameSessionPlayingRuntime implements GameSessionPlayingRuntimePort {
  constructor(
    @inject(SocketIoGameSessionConnection)
    private readonly connection: SocketIoGameSessionConnection,
  ) {}

  observeSession(pin: string): void {
    this.connection.observeSession(pin);
  }

  submitAction(command: SubmitGameActionCommand): void {
    this.connection.emit('submit-action', {
      pin: command.pin,
      actionId: command.actionId,
      timeLeft: command.timeLeft,
      userId: command.userId,
      guestId: command.guestId,
    });
  }

  on<TEventName extends GameSessionPlayingRuntimeEventKey>(
    eventName: TEventName,
    handler: GameSessionPlayingRuntimeHandler<TEventName>,
  ): void {
    this.connection.on(eventName, handler as (...args: unknown[]) => void);
  }

  off<TEventName extends GameSessionPlayingRuntimeEventKey>(
    eventName: TEventName,
    handler: GameSessionPlayingRuntimeHandler<TEventName>,
  ): void {
    this.connection.off(eventName, handler as (...args: unknown[]) => void);
  }
}
