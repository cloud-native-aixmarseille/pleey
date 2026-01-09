import { Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { GameSessionState } from '../../../domain/game/entities/game-session-state';
import {
  type GameTimerService,
  GameTimerServiceProvider,
} from '../../../domain/game/ports/game-timer.service.interface';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/repositories/game-session.repository.interface';
import {
  type SessionStateRepository,
  SessionStateRepositoryProvider,
} from '../../../domain/game/repositories/session-state.repository.interface';
import { GameErrorCode } from '../enums/game-error-code.enum';
import {
  type GameBroadcastService,
  GameBroadcastServiceProvider,
  type LeaderboardEntry,
} from '../ports';

interface EndGameInput {
  pin: string;
  hostId: number;
}

/**
 * Use case for ending a game session.
 * Follows Single Responsibility Principle - only handles game ending logic.
 */
@Injectable()
export class EndGameUseCase {
  constructor(
    @Inject(SessionStateRepositoryProvider)
    private readonly sessionStateRepository: SessionStateRepository,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameTimerServiceProvider)
    private readonly timerService: GameTimerService,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
  ) {}

  async execute(input: EndGameInput): Promise<void> {
    const state = await this.sessionStateRepository.getOrCreate(input.pin);
    const session = await this.gameSessionRepository.findByPin(input.pin);

    if (!session) {
      throw new WsException(GameErrorCode.GAME_NOT_FOUND);
    }

    if (session.hostId !== input.hostId) {
      throw new WsException(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
    }

    await this.endGame(input.pin, state);
  }

  async endGame(pin: string, state: GameSessionState): Promise<void> {
    // Clear timer when ending game
    this.timerService.clearAnswerRevealTimer(pin);

    await this.gameSessionRepository.updateStatus(state.sessionId, 'ended');

    // Get final leaderboard
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

    this.broadcastService.publish({ type: 'game-ended', pin, leaderboard });
    await this.sessionStateRepository.remove(pin);
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
