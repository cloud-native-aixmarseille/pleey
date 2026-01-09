import { Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import {
  type GameTimerService,
  GameTimerServiceProvider,
} from '../../../domain/game/ports/game-timer.service.interface';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/repositories/game-session.repository.interface';
import {
  type SessionStateRepository,
  SessionStateRepositoryProvider,
} from '../../../domain/game/repositories/session-state.repository.interface';
import { GameErrorCode } from '../enums/game-error-code.enum';
import { type GameBroadcastService, GameBroadcastServiceProvider } from '../ports';

@Injectable()
export class PauseGameWsUseCase {
  constructor(
    @Inject(SessionStateRepositoryProvider)
    private readonly sessionStateRepository: SessionStateRepository,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameTimerServiceProvider)
    private readonly timerService: GameTimerService,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
  ) {}

  async execute(pin: string, hostId: number): Promise<void> {
    const state = await this.sessionStateRepository.getOrCreate(pin);
    const session = await this.gameSessionRepository.findByPin(pin);

    if (!session) {
      throw new WsException(GameErrorCode.GAME_NOT_FOUND);
    }

    if (session.hostId !== hostId) {
      throw new WsException(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
    }

    this.timerService.clearAnswerRevealTimer(pin);
    const remainingTime = state.pause();
    await this.sessionStateRepository.save(pin, state);

    await this.gameSessionRepository.updateStatus(session.id, 'paused');
    this.broadcastService.publish({ type: 'game-paused', pin, timeLeft: remainingTime });
  }
}
