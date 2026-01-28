import { Inject, Injectable } from '@nestjs/common';
import type { GameSessionPin } from '../../../../../domain/game/entities/game-session';
import {
  type GameRevealResultHandlerRegistry,
  GameRevealResultHandlerRegistryProvider,
} from '../../../../../domain/game/ports/handlers/game-reveal-result-handler.registry';
import { GameSessionPinContextService } from '../../shared/services/game-session-pin-context-service';

@Injectable()
export class RevealGameResultUseCase {
  constructor(
    private readonly gameSessionPinContextService: GameSessionPinContextService,
    @Inject(GameRevealResultHandlerRegistryProvider)
    private readonly revealResultHandlerRegistry: GameRevealResultHandlerRegistry,
  ) {}

  async execute(pin: GameSessionPin): Promise<void> {
    const context = await this.gameSessionPinContextService.loadExisting(pin);
    if (!context) {
      return;
    }
    const { state, session, game } = context;

    const handler = this.revealResultHandlerRegistry.resolve(game.type);
    await handler.reveal({ pin, state, session });
  }
}
