import { Inject, Injectable } from '@nestjs/common';
import type {
  GameRevealResultHandler,
  GameRevealResultHandlerRegistry,
} from '../../../domain/game/ports/handlers/game-reveal-result-handler.registry';
import {
  AbstractGameTypeRegistry,
  type GameTypeBinding,
} from '../services/abstract-game-type-registry.service';

export const GAME_REVEAL_RESULT_HANDLERS = Symbol('GAME_REVEAL_RESULT_HANDLERS');

@Injectable()
export class GameRevealResultHandlerRegistryService
  extends AbstractGameTypeRegistry<GameRevealResultHandler>
  implements GameRevealResultHandlerRegistry
{
  constructor(
    @Inject(GAME_REVEAL_RESULT_HANDLERS)
    handlers: GameTypeBinding<GameRevealResultHandler>[],
  ) {
    super(handlers);
  }
}
