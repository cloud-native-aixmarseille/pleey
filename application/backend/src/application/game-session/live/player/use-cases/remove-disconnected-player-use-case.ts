import { Inject, Injectable } from '@nestjs/common';
import {
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
} from '../../../../../domain/game/ports/services/game-broadcast.service';
import { GameSessionStateService } from '../../../../../domain/game/services/game-session-state-service';

@Injectable()
export class RemoveDisconnectedPlayerUseCase {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
  ) {}

  async execute(connectionId: string): Promise<void> {
    const pin = await this.gameSessionStateService.findPinBySocketId(connectionId);
    if (!pin) {
      return;
    }

    const state = await this.gameSessionStateService.get(pin);
    if (!state) {
      return;
    }

    const removed = state.removePlayerBySocketId(connectionId);
    if (!removed) {
      return;
    }

    if (state.playerCount === 0 && !state.hasStages) {
      await this.gameSessionStateService.remove(pin);
      return;
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
  }
}
