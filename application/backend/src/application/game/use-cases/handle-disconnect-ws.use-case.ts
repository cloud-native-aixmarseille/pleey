import { Inject, Injectable } from '@nestjs/common';
import { GameSessionStateService } from '../../../domain/game/services/game-session-state.service';
import {
  GameBroadcastEventType,
  type GameBroadcastService,
  GameBroadcastServiceProvider,
} from '../ports';

@Injectable()
export class HandleDisconnectWsUseCase {
  constructor(
    private readonly gameSessionStateService: GameSessionStateService,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
  ) {}

  async execute(socketId: string): Promise<void> {
    const pin = await this.gameSessionStateService.findPinBySocketId(socketId);
    if (!pin) {
      return;
    }

    const state = await this.gameSessionStateService.get(pin);
    if (!state) {
      return;
    }

    const removed = state.removePlayerBySocketId(socketId);
    if (!removed) {
      return;
    }

    if (state.playerCount === 0 && !state.hasQuestions) {
      await this.gameSessionStateService.remove(pin);
      return;
    }

    await this.gameSessionStateService.update(pin, state);

    this.broadcastService.publish({
      type: GameBroadcastEventType.PLAYER_JOINED,
      pin,
      sessionId: state.sessionId,
      players: state.getNonHostPlayers(),
    });
  }
}
