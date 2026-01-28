import { inject, injectable } from 'inversify';
import type {
  EndGameCommand,
  GameSessionHostControlRuntimePort,
  NextStageCommand,
  PauseGameCommand,
  RestartStageCommand,
  ResumeGameCommand,
  ReturnToLobbyCommand,
  RewindStageCommand,
} from '../../../application/game-session/live/host/ports/game-session-host-control-runtime.port';
import { SocketIoGameSessionConnection } from './socket-io-game-session-connection';

@injectable()
export class SocketIoGameSessionHostControlRuntime implements GameSessionHostControlRuntimePort {
  constructor(
    @inject(SocketIoGameSessionConnection)
    private readonly connection: SocketIoGameSessionConnection,
  ) {}

  pauseGame(command: PauseGameCommand): void {
    this.connection.emit('stop-game', { pin: command.pin });
  }

  resumeGame(command: ResumeGameCommand): void {
    this.connection.emit('resume-game', { pin: command.pin });
  }

  restartStage(command: RestartStageCommand): void {
    this.connection.emit('restart-stage', { pin: command.pin });
  }

  rewindStage(command: RewindStageCommand): void {
    this.connection.emit('previous-stage', { pin: command.pin });
  }

  returnToLobby(command: ReturnToLobbyCommand): void {
    this.connection.emit('return-to-lobby', { pin: command.pin });
  }

  nextStage(command: NextStageCommand): void {
    this.connection.emit('next-stage', { pin: command.pin });
  }

  endGame(command: EndGameCommand): void {
    this.connection.emit('end-game', { pin: command.pin });
  }
}
