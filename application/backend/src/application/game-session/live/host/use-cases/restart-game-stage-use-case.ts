import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../../domain/auth/entities/user';
import type { GameSessionPin } from '../../../../../domain/game/entities/game-session';
import { GameErrorCode } from '../../../../../domain/game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../../../../domain/game/enums/game-session-status.enum';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../../../domain/game/ports/repositories/game-session.repository';
import {
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
} from '../../../../../domain/game/ports/services/game-broadcast.service';
import { ResultRevealSchedulerService } from '../../../../../domain/game/services/result-reveal-scheduler-service';
import { HostStageControlContextService } from '../services/host-stage-control-context-service';
import { AbstractHostAuthorizedUseCase } from './abstract-host-authorized-use-case';

@Injectable()
export class RestartGameStageUseCase extends AbstractHostAuthorizedUseCase {
  constructor(
    hostStageControlContextService: HostStageControlContextService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
    private readonly resultRevealScheduler: ResultRevealSchedulerService,
  ) {
    super(hostStageControlContextService);
  }

  async execute(pin: GameSessionPin, hostId: UserId): Promise<void> {
    const { state, session, game } = await this.loadAuthorizedHostGameContext(pin, hostId);

    if (!state.currentStage) {
      throw new Error(GameErrorCode.NO_CURRENT_STAGE_TO_RESUME);
    }

    this.resultRevealScheduler.clear(pin);
    state.restartCurrentStage();

    await this.hostStageControlContextService.updateState(pin, state);
    await this.gameSessionRepository.updateCurrentStage(state.sessionId, state.currentStage.id);

    if (session.status !== GameSessionStatus.ACTIVE) {
      await this.gameSessionRepository.updateStatus(state.sessionId, GameSessionStatus.ACTIVE);
    }

    this.resultRevealScheduler.schedule(pin, state.currentStage.timeLimit);
    this.broadcastService.publish({
      type: GameBroadcastEventType.NEXT_STAGE,
      pin,
      gameTitle: state.gameTitle,
      gameType: game.type,
      activePlayerCount: state.getNonHostPlayers().length,
      stage: state.currentStage,
    });
  }
}
