import { Inject, Injectable } from '@nestjs/common';
import {
  type SessionStateRepository,
  SessionStateRepositoryProvider,
} from '../../../domain/game/repositories/session-state.repository.interface';
import { type GameBroadcastService, GameBroadcastServiceProvider } from '../ports';

@Injectable()
export class HandleDisconnectWsUseCase {
  constructor(
    @Inject(SessionStateRepositoryProvider)
    private readonly sessionStateRepository: SessionStateRepository,
    @Inject(GameBroadcastServiceProvider)
    private readonly broadcastService: GameBroadcastService,
  ) {}

  async execute(socketId: string): Promise<void> {
    const pin = await this.sessionStateRepository.findPinBySocketId(socketId);
    if (!pin) {
      return;
    }

    const state = await this.sessionStateRepository.get(pin);
    if (!state) {
      return;
    }

    const removed = state.removePlayerBySocketId(socketId);
    if (!removed) {
      return;
    }

    if (state.playerCount === 0 && state.currentQuestionIndex >= state.totalQuestions) {
      await this.sessionStateRepository.remove(pin);
      return;
    }

    await this.sessionStateRepository.save(pin, state);

    this.broadcastService.publish({
      type: 'player-joined',
      pin,
      sessionId: state.sessionId,
      players: state.getNonHostPlayers(),
    });
  }
}
