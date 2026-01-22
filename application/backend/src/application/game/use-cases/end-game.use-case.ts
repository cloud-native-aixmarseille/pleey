import { Inject, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import type { UserId } from '../../../domain/auth/entities/user.entity';
import type { GameSessionPin } from '../../../domain/game/entities/game-session';
import { GameSessionState } from '../../../domain/game/entities/game-session-state';
import type { GuestId } from '../../../domain/game/entities/player-state';
import { GameErrorCode } from '../../../domain/game/enums/game-error-code.enum';
import { GameSessionStatus } from '../../../domain/game/enums/game-session-status.enum';
import {
  type GameSessionRepository,
  GameSessionRepositoryProvider,
} from '../../../domain/game/ports/game-session.repository';
import {
  type GameTimerService,
  GameTimerServiceProvider,
} from '../../../domain/game/ports/game-timer.service';
import { GameSessionStateService } from '../../../domain/game/services/game-session-state.service';
import {
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
  type LeaderboardEntry,
} from '../ports';

interface EndGameInput {
  pin: GameSessionPin;
  hostId: UserId;
}

/**
 * Use case for ending a game session.
 * Follows Single Responsibility Principle - only handles game ending logic.
 */
@Injectable()
export class EndGameUseCase {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameSessionRepositoryProvider)
    private readonly gameSessionRepository: GameSessionRepository,
    @Inject(GameTimerServiceProvider)
    private readonly timerService: GameTimerService,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
  ) {}

  async execute(input: EndGameInput): Promise<void> {
    const state = await this.gameSessionStateService.getOrCreate(input.pin);
    const session = await this.gameSessionRepository.findByPin(input.pin);

    if (!session) {
      throw new WsException(GameErrorCode.GAME_NOT_FOUND);
    }

    if (session.hostId !== input.hostId) {
      throw new WsException(GameErrorCode.UNAUTHORIZED_SESSION_CONTROL);
    }

    await this.endGame(input.pin, state);
  }

  async endGame(pin: GameSessionPin, state: GameSessionState): Promise<void> {
    // Clear timer when ending game
    this.timerService.clearAnswerRevealTimer(pin);

    await this.gameSessionRepository.updateStatus(state.sessionId, GameSessionStatus.ENDED);

    // Get final leaderboard
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
