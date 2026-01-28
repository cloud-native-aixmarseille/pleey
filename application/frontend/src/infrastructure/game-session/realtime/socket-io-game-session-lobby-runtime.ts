import { inject, injectable } from 'inversify';
import type {
  GameSessionLobbyRuntimeEventKey,
  GameSessionLobbyRuntimeHandler,
  GameSessionLobbyRuntimePort,
} from '../../../application/game-session/live/player/ports/game-session-lobby-runtime.port';
import { SocketIoGameSessionConnection } from './socket-io-game-session-connection';

@injectable()
export class SocketIoGameSessionLobbyRuntime implements GameSessionLobbyRuntimePort {
  constructor(
    @inject(SocketIoGameSessionConnection)
    private readonly connection: SocketIoGameSessionConnection,
  ) {}

  on<TEventName extends GameSessionLobbyRuntimeEventKey>(
    eventName: TEventName,
    handler: GameSessionLobbyRuntimeHandler<TEventName>,
  ): void {
    this.connection.on(eventName, handler as (...args: unknown[]) => void);
  }

  off<TEventName extends GameSessionLobbyRuntimeEventKey>(
    eventName: TEventName,
    handler: GameSessionLobbyRuntimeHandler<TEventName>,
  ): void {
    this.connection.off(eventName, handler as (...args: unknown[]) => void);
  }

  observeSession(pin: string): void {
    this.connection.observeSession(pin);
  }

  startGame(pin: string): void {
    this.connection.emit('start-game', { pin });
  }

  disconnect(): void {
    this.connection.disconnect();
  }
}
