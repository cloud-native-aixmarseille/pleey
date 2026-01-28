import { Inject, Injectable } from '@nestjs/common';
import type {
  GamePauseHandler,
  GamePauseHandlerRegistry,
} from '../../../domain/game/ports/handlers/game-pause-handler.registry';
import {
  AbstractGameTypeRegistry,
  type GameTypeBinding,
} from '../services/abstract-game-type-registry.service';

export const GAME_PAUSE_HANDLERS = Symbol('GAME_PAUSE_HANDLERS');

@Injectable()
export class GamePauseHandlerRegistryService
  extends AbstractGameTypeRegistry<GamePauseHandler>
  implements GamePauseHandlerRegistry
{
  constructor(
    @Inject(GAME_PAUSE_HANDLERS)
    handlers: GameTypeBinding<GamePauseHandler>[],
  ) {
    super(handlers);
  }
}
