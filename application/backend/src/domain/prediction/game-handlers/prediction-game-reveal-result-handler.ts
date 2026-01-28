import { Inject, Injectable } from '@nestjs/common';
import type { GameSessionPin } from '../../game/entities/game-session';
import type { GameSessionState } from '../../game/entities/game-session-state';
import type { GuestId } from '../../game/entities/player-state';
import type {
  GameRevealResultHandler,
  GameRevealResultHandlerInput,
} from '../../game/ports/handlers/game-reveal-result-handler.registry';
import {
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
  type LeaderboardEntry,
} from '../../game/ports/services/game-broadcast.service';
import {
  type GameTimerService,
  GameTimerServiceProvider,
} from '../../game/ports/services/game-timer.service';
import { ActionDistributionService } from '../../game/services/action-distribution-service';

@Injectable()
export class PredictionGameRevealResultHandler implements GameRevealResultHandler {
  constructor(
    @Inject(GameTimerServiceProvider)
    private readonly timerService: GameTimerService,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
    private readonly actionDistributionService: ActionDistributionService,
  ) {}

  async reveal({ pin, state }: GameRevealResultHandlerInput): Promise<void> {
    this.timerService.clearResultRevealTimer(pin);

    const currentStage = state.currentStage;
    if (!currentStage) {
      return;
    }

    const actions = state.getAllActions();
    const actionDistribution = this.actionDistributionService.calculateActionDistribution(actions);
    const statistics = {
      totalActions: state.actionCount,
      actionDistribution,
    };
    const resultSummary = {
      isCorrect: false,
      points: 0,
      correctActionIds: state.getCorrectActionIds(),
      statistics,
    };

    for (const [socketId, player] of state.getPlayerEntries()) {
      const playerAction = state.getAction(player.playerId);

      const result = {
        isCorrect: playerAction?.isCorrect ?? false,
        points: playerAction?.points ?? 0,
        correctActionIds: state.getCorrectActionIds(),
        statistics,
      };

      this.broadcastService.publish({
        type: GameBroadcastEventType.ACTION_RESULT,
        connectionId: socketId,
        result,
      });
    }

    this.broadcastService.publish({
      type: GameBroadcastEventType.RESULT_REVEALED,
      pin,
      result: resultSummary,
    });

    this.broadcastLeaderboard(pin, state);
  }

  private broadcastLeaderboard(pin: GameSessionPin, state: GameSessionState): void {
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
      type: GameBroadcastEventType.LEADERBOARD_UPDATED,
      pin,
      leaderboard,
    });
  }
}
