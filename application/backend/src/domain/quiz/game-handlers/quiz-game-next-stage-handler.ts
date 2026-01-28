import { Inject, Injectable } from '@nestjs/common';
import type {
  GameNextStageHandler,
  GameNextStageHandlerInput,
} from '../../game/ports/handlers/game-next-stage-handler.registry';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../game/ports/repositories/game-session.repository';
import {
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
} from '../../game/ports/services/game-broadcast.service';
import {
  type GameEndingService,
  GameEndingServiceProvider,
} from '../../game/ports/services/game-ending.service';
import { GameSessionStateService } from '../../game/services/game-session-state-service';
import { ResultRevealSchedulerService } from '../../game/services/result-reveal-scheduler-service';

@Injectable()
export class QuizGameNextStageHandler implements GameNextStageHandler {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
    @Inject(GameEndingServiceProvider)
    private readonly gameEndingService: GameEndingService,
    private readonly resultRevealScheduler: ResultRevealSchedulerService,
  ) {}

  async nextStage({ pin, state }: GameNextStageHandlerInput): Promise<void> {
    if (!state.hasMoreStages) {
      await this.gameEndingService.endGame(pin, state);
      return;
    }

    state.advanceToNextStage();
    await this.gameSessionStateService.update(pin, state);
    const nextStage = state.currentStage;
    if (!nextStage) {
      await this.gameEndingService.endGame(pin, state);
      return;
    }

    await this.gameSessionRepository.updateCurrentStage(state.sessionId, nextStage.id);
    this.resultRevealScheduler.schedule(pin, nextStage.timeLimit);

    this.broadcastService.publish({
      type: GameBroadcastEventType.NEXT_STAGE,
      pin,
      gameTitle: state.gameTitle,
      gameType: state.gameType,
      activePlayerCount: state.getNonHostPlayers().length,
      stage: nextStage,
    });
  }
}
