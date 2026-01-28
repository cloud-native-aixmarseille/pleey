import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../../domain/auth/entities/user';
import type { GameSessionPin } from '../../../../../domain/game/entities/game-session';
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
export class ReturnGameToLobbyUseCase extends AbstractHostAuthorizedUseCase {
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
    const { state, session } = await this.loadAuthorizedHostContext(pin, hostId);

    this.resultRevealScheduler.clear(pin);
    state.returnToLobby();

    await this.hostStageControlContextService.updateState(pin, state);
    await this.gameSessionRepository.updateCurrentStage(state.sessionId, null);

    if (session.status !== GameSessionStatus.WAITING) {
      await this.gameSessionRepository.updateStatus(state.sessionId, GameSessionStatus.WAITING);
    }

    this.broadcastService.publish({
      type: GameBroadcastEventType.RETURNED_TO_LOBBY,
      pin,
      sessionId: state.sessionId,
      gameTitle: state.gameTitle,
      gameType: state.gameType,
      players: state.getAllPlayers(),
    });
  }
}
