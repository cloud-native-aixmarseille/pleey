import { Inject, Injectable } from '@nestjs/common';
import type { UserId } from '../../../../domain/auth/entities/user';
import {
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
} from '../../../../domain/game/ports/services/game-broadcast.service';
import { GameSessionStateService } from '../../../../domain/game/services/game-session-state-service';

@Injectable()
export class LeaveCurrentPlayerSessionUseCase {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
  ) {}

  async execute(userId: UserId): Promise<boolean> {
    const pin = await this.gameSessionStateService.findPinByUserId(userId);

    if (!pin) {
      return false;
    }

    await this.gameSessionStateService.removePinByUserId(userId);

    const state = await this.gameSessionStateService.get(pin);

    if (!state) {
      return true;
    }

    const removed = state.removePlayerByUserId(userId);

    if (!removed) {
      return true;
    }

    if (state.playerCount === 0 && !state.hasStages) {
      await this.gameSessionStateService.remove(pin);
      return true;
    }

    await this.gameSessionStateService.update(pin, state);

    this.broadcastService.publish({
      type: GameBroadcastEventType.PLAYER_JOINED,
      pin,
      sessionId: state.sessionId,
      gameTitle: state.gameTitle,
      gameType: state.gameType,
      players: state.getNonHostPlayers(),
    });

    return true;
  }
}
