import { Inject, Injectable } from '@nestjs/common';
import { GameErrorCode } from '../../game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../game/enums/game-session-status.enum';
import type {
  GameStartHandler,
  GameStartHandlerInput,
} from '../../game/ports/handlers/game-start-handler.registry';
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
export class PredictionGameStartHandler implements GameStartHandler {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
    private readonly resultRevealScheduler: ResultRevealSchedulerService,
  ) {}

  async start({ pin, state }: GameStartHandlerInput): Promise<void> {
    if (!state.hasStages) {
      throw new Error(GameErrorCode.NO_STAGES_AVAILABLE);
    }

    state.startFirstStage();
    await this.gameSessionStateService.update(pin, state);
    await this.gameSessionRepository.updateStatus(state.sessionId, GameSessionStatus.ACTIVE);

    const currentStage = state.currentStage;
    if (!currentStage) {
      throw new Error(GameErrorCode.NO_STAGES_AVAILABLE);
    }

    await this.gameSessionRepository.updateCurrentStage(state.sessionId, currentStage.id);
    this.resultRevealScheduler.schedule(pin, currentStage.timeLimit);

    this.broadcastService.publish({
      type: GameBroadcastEventType.GAME_STARTED,
      pin,
      gameTitle: state.gameTitle,
      gameType: state.gameType,
      activePlayerCount: state.getNonHostPlayers().length,
      stage: currentStage,
      totalStages: state.totalStages,
    });
  }
}
