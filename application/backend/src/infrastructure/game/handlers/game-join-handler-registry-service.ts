import { Inject, Injectable } from '@nestjs/common';
import type {
  GameJoinHandler,
  GameJoinHandlerRegistry,
} from '../../../domain/game/ports/handlers/game-join-handler.registry';
import {
  AbstractGameTypeRegistry,
  type GameTypeBinding,
} from '../services/abstract-game-type-registry.service';

export const GAME_JOIN_HANDLERS = Symbol('GAME_JOIN_HANDLERS');

@Injectable()
export class GameJoinHandlerRegistryService
  extends AbstractGameTypeRegistry<GameJoinHandler>
  implements GameJoinHandlerRegistry
{
  constructor(
    @Inject(GAME_JOIN_HANDLERS)
    handlers: GameTypeBinding<GameJoinHandler>[],
  ) {
    super(handlers);
  }
}
