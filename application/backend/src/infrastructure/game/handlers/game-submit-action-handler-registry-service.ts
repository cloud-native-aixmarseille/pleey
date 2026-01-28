import { Inject, Injectable } from '@nestjs/common';
import type {
  GameSubmitActionHandler,
  GameSubmitActionHandlerRegistry,
} from '../../../domain/game/ports/handlers/game-submit-action-handler.registry';
import {
  AbstractGameTypeRegistry,
  type GameTypeBinding,
} from '../services/abstract-game-type-registry.service';

export const GAME_SUBMIT_ACTION_HANDLERS = Symbol('GAME_SUBMIT_ACTION_HANDLERS');

@Injectable()
export class GameSubmitActionHandlerRegistryService
  extends AbstractGameTypeRegistry<GameSubmitActionHandler>
  implements GameSubmitActionHandlerRegistry
{
  constructor(
    @Inject(GAME_SUBMIT_ACTION_HANDLERS)
    handlers: GameTypeBinding<GameSubmitActionHandler>[],
  ) {
    super(handlers);
  }
}
