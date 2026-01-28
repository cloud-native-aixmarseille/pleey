import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../../domain/auth/entities/user';
import type { GameSessionPin } from '../../../../../domain/game/entities/game-session';
import { GameSessionState } from '../../../../../domain/game/entities/game-session-state';
import type { GuestId } from '../../../../../domain/game/entities/player-state';
import { GameSessionStatus } from '../../../../../domain/game/enums/game-session-status.enum';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../../../domain/game/ports/repositories/game-session.repository';
import {
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
  type LeaderboardEntry,
} from '../../../../../domain/game/ports/services/game-broadcast.service';
import {
  type GameTimerService,
  GameTimerServiceProvider,
} from '../../../../../domain/game/ports/services/game-timer.service';
import { GameSessionStateService } from '../../../../../domain/game/services/game-session-state-service';
import { HostStageControlContextService } from '../services/host-stage-control-context-service';
import { AbstractHostAuthorizedUseCase } from './abstract-host-authorized-use-case';

interface EndGameInput {
  pin: GameSessionPin;
  hostId: UserId;
}

@Injectable()
export class EndGameUseCase extends AbstractHostAuthorizedUseCase {
  constructor(
    hostStageControlContextService: HostStageControlContextService,
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameTimerServiceProvider)
    private readonly timerService: GameTimerService,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
  ) {
    super(hostStageControlContextService);
  }

  async execute(input: EndGameInput): Promise<void> {
    const { state } = await this.loadAuthorizedHostContext(input.pin, input.hostId);

    await this.endGame(input.pin, state);
  }

  async endGame(pin: GameSessionPin, state: GameSessionState): Promise<void> {
    this.timerService.clearResultRevealTimer(pin);

    await this.gameSessionRepository.updateStatus(state.sessionId, GameSessionStatus.ENDED);
    await this.gameSessionStateService.removePinsBySession(pin);

    const scores = state.getScoresExcludingHost();
    scores.sort((a, b) => b.totalPoints - a.totalPoints);

    const leaderboard: LeaderboardEntry[] = scores.map((entry, index) => {
      const identity =
        entry.userId !== undefined
          ? { userId: entry.userId }
          : { guestId: entry.guestId as GuestId };

      return {
        ...identity,
        username: entry.username,
        totalPoints: entry.totalPoints,
        rank: index + 1,
      };
    });

    this.broadcastService.publish({
      type: GameBroadcastEventType.GAME_ENDED,
      pin,
      leaderboard,
    });
    await this.gameSessionStateService.remove(pin);
  }
}
