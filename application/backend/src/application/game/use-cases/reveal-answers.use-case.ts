import { Inject, Injectable } from '@nestjs/common';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';
import type { GameSessionState } from '../../../domain/game/entities/game-session-state';
import type { GuestId } from '../../../domain/game/entities/player-state';
import {
  type GameTimerService,
  GameTimerServiceProvider,
} from '../../../domain/game/ports/game-timer.service';
import { calculateAnswerDistribution } from '../../../domain/game/services/answer-distribution.util';
import { GameSessionStateService } from '../../../domain/game/services/game-session-state.service';
import {
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
  type LeaderboardEntry,
} from '../ports';

/**
 * Use case for revealing answers when timer expires or all players have answered.
 * Follows Single Responsibility Principle - only handles answer revelation logic.
 */
@Injectable()
export class RevealAnswersUseCase {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameTimerServiceProvider)
    private readonly timerService: GameTimerService,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
  ) {}

  async execute(pin: GameSessionPin): Promise<void> {
    const state = await this.gameSessionStateService.get(pin);
    if (!state) {
      return;
    }

    // Clear any existing timer
    this.timerService.clearAnswerRevealTimer(pin);

    const currentQuestion = state.currentQuestion;
    if (!currentQuestion) {
      return;
    }

    // Calculate answer statistics
    const answers = state.getAllAnswers();
    const answerDistribution = calculateAnswerDistribution(answers);
    const statistics = {
      totalAnswers: state.answeredCount,
      answerDistribution,
    };

    // Send individual results to each player
    for (const [socketId, player] of state.getPlayerEntries()) {
      const playerAnswer = state.getAnswer(player.playerId);

      const result = {
        isCorrect: playerAnswer?.isCorrect ?? false,
        points: playerAnswer?.points ?? 0,
        correctAnswerIds: currentQuestion.getCorrectAnswers().map((answer) => answer.id),
        statistics,
      };

      this.broadcastService.publish({
        type: GameBroadcastEventType.ANSWER_RESULT,
        connectionId: socketId,
        result,
      });
    }

    // Broadcast updated leaderboard
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
