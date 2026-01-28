import { Inject, Injectable } from '@nestjs/common';
import type {
  GameNextStageHandler,
  GameNextStageHandlerRegistry,
} from '../../../domain/game/ports/handlers/game-next-stage-handler.registry';
import {
  AbstractGameTypeRegistry,
  type GameTypeBinding,
} from '../services/abstract-game-type-registry.service';

export const GAME_NEXT_STAGE_HANDLERS = Symbol('GAME_NEXT_STAGE_HANDLERS');

@Injectable()
export class GameNextStageHandlerRegistryService
  extends AbstractGameTypeRegistry<GameNextStageHandler>
  implements GameNextStageHandlerRegistry
{
  constructor(
    @Inject(GAME_NEXT_STAGE_HANDLERS)
    handlers: GameTypeBinding<GameNextStageHandler>[],
  ) {
    super(handlers);
  }
}
