import { Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/ports/game-session.repository';
import {
  type GameTimerService,
  GameTimerServiceProvider,
} from '../../../domain/game/ports/game-timer.service';
import { GameSessionStateService } from '../../../domain/game/services/game-session-state.service';
import {
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
} from '../ports';

@Injectable()
export class PauseGameWsUseCase {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameTimerServiceProvider)
    private readonly timerService: GameTimerService,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
  ) {}

  async execute(pin: GameSessionPin, hostId: UserId): Promise<void> {
    const state = await this.gameSessionStateService.getOrCreate(pin);
    const session = await this.gameSessionRepository.findByPin(pin);

    if (!session) {
      throw new WsException(GameErrorCode.GAME_NOT_FOUND);
    }

    if (session.hostId !== hostId) {
      throw new WsException(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
    }

    this.timerService.clearAnswerRevealTimer(pin);
    const remainingTime = state.pause();
    await this.gameSessionStateService.update(pin, state);

    await this.gameSessionRepository.updateStatus(session.id, GameSessionStatus.PAUSED);
    this.broadcastService.publish({
      type: GameBroadcastEventType.GAME_PAUSED,
      pin,
      timeLeft: remainingTime,
    });
  }
}
