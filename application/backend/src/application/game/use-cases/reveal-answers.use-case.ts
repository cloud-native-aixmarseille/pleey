import { Inject, Injectable } from '@nestjs/common';
import type { GameSessionState } from '../../../domain/game/entities/game-session-state';
import {
  type GameTimerService,
  GameTimerServiceProvider,
} from '../../../domain/game/ports/game-timer.service.interface';
import {
  type SessionStateRepository,
  SessionStateRepositoryProvider,
} from '../../../domain/game/repositories/session-state.repository.interface';
import { calculateAnswerDistribution } from '../../../domain/game/services/answer-distribution.util';
import {
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
    @Inject(SessionStateRepositoryProvider)
    private readonly sessionStateRepository: SessionStateRepository,
    @Inject(GameTimerServiceProvider)
    private readonly timerService: GameTimerService,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
  ) {}

  async execute(pin: string): Promise<void> {
    const state = await this.sessionStateRepository.get(pin);
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
        correctAnswer: currentQuestion.correctAnswer,
        statistics,
      };

      this.broadcastService.publish({
        type: 'answer-result',
        connectionId: socketId,
        result,
      });
    }

    // Broadcast updated leaderboard
    this.broadcastLeaderboard(pin, state);
  }

  private broadcastLeaderboard(pin: string, state: GameSessionState): void {
    const scores = state.getScoresExcludingHost();
    scores.sort((a, b) => b.totalPoints - a.totalPoints);

    const leaderboard: LeaderboardEntry[] = scores.map((entry, index) => ({
      userId: this.extractUserIdFromPlayerId(entry.playerId),
      guestId: this.extractGuestIdFromPlayerId(entry.playerId),
      username: entry.username,
      totalPoints: entry.totalPoints,
      rank: index + 1,
      isGuest: entry.isGuest,
    }));

    this.broadcastService.publish({ type: 'leaderboard-updated', pin, leaderboard });
  }

  private extractUserIdFromPlayerId(playerId: string): number | undefined {
    if (playerId.startsWith('user-')) {
      return Number.parseInt(playerId.substring(5), 10);
    }
    return undefined;
  }

  private extractGuestIdFromPlayerId(playerId: string): string | undefined {
    if (playerId.startsWith('guest-')) {
      return playerId.substring(6);
    }
    return undefined;
  }
}
