import { Inject, Injectable } from '@nestjs/common';
import { GameErrorCode } from '../../game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../game/enums/game-session-status.enum';
import type {
  GameResumeHandler,
  GameResumeHandlerInput,
} from '../../game/ports/handlers/game-resume-handler.registry';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../game/ports/repositories/game-session.repository';
import {
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
} from '../../game/ports/services/game-broadcast.service';
import { GameSessionStateService } from '../../game/services/game-session-state-service';
import { ResultRevealSchedulerService } from '../../game/services/result-reveal-scheduler-service';

@Injectable()
export class PredictionGameResumeHandler implements GameResumeHandler {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
    private readonly resultRevealScheduler: ResultRevealSchedulerService,
  ) {}

  async resume({ pin, state, session }: GameResumeHandlerInput): Promise<void> {
    await this.gameSessionRepository.updateStatus(session.id, GameSessionStatus.ACTIVE);

    const remainingTime = state.resume();
    await this.gameSessionStateService.update(pin, state);
    const currentStage = state.currentStage;
    if (!currentStage) {
      throw new Error(GameErrorCode.NO_STAGES_AVAILABLE);
    }

    if (remainingTime > 0) {
      this.resultRevealScheduler.schedule(pin, remainingTime);
    }

    this.broadcastService.publish({
      type: GameBroadcastEventType.GAME_RESUMED,
      pin,
      gameTitle: state.gameTitle,
      gameType: state.gameType,
      activePlayerCount: state.getNonHostPlayers().length,
      stage: currentStage,
      totalStages: state.totalStages,
      timeLeft: remainingTime,
    });
  }
}
