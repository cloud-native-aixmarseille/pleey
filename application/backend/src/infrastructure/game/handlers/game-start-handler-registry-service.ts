import { Inject, Injectable } from '@nestjs/common';
import type {
  GameStartHandler,
  GameStartHandlerRegistry,
} from '../../../domain/game/ports/handlers/game-start-handler.registry';
import {
  AbstractGameTypeRegistry,
  type GameTypeBinding,
} from '../services/abstract-game-type-registry.service';

export const GAME_START_HANDLERS = Symbol('GAME_START_HANDLERS');

@Injectable()
export class GameStartHandlerRegistryService
  extends AbstractGameTypeRegistry<GameStartHandler>
  implements GameStartHandlerRegistry
{
  constructor(
    @Inject(GAME_START_HANDLERS)
    handlers: GameTypeBinding<GameStartHandler>[],
  ) {
    super(handlers);
  }
}
