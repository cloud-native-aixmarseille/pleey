import { Inject, Injectable } from '@nestjs/common';
import type { GameSessionPin } from '../../game/entities/game-session';
import { GameSessionStatus } from '../../game/enums/game-session-status.enum';
import type {
  GamePauseHandler,
  GamePauseHandlerInput,
} from '../../game/ports/handlers/game-pause-handler.registry';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../game/ports/repositories/game-session.repository';
import {
  type GameBroadcastEvent,
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
} from '../../game/ports/services/game-broadcast.service';
import {
  type GameTimerService,
  GameTimerServiceProvider,
} from '../../game/ports/services/game-timer.service';
import { GameSessionStateService } from '../../game/services/game-session-state-service';

@Injectable()
export class PredictionGamePauseHandler implements GamePauseHandler {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameTimerServiceProvider)
    private readonly timerService: GameTimerService,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
  ) {}

  async pause({ pin, state, session }: GamePauseHandlerInput): Promise<void> {
    this.timerService.clearResultRevealTimer(pin);
    const remainingTime = state.pause();
    await this.gameSessionStateService.update(pin, state);

    await this.gameSessionRepository.updateStatus(session.id, GameSessionStatus.PAUSED);
    this.broadcastService.publish(this.buildGamePausedEvent(pin, remainingTime));
  }

  private buildGamePausedEvent(pin: GameSessionPin, timeLeft: number): GameBroadcastEvent {
    return {
      type: GameBroadcastEventType.GAME_PAUSED,
      pin,
      timeLeft,
    };
  }
}
