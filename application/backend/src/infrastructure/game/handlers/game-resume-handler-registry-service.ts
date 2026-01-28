import { Inject, Injectable } from '@nestjs/common';
import type {
  GameResumeHandler,
  GameResumeHandlerRegistry,
} from '../../../domain/game/ports/handlers/game-resume-handler.registry';
import {
  AbstractGameTypeRegistry,
  type GameTypeBinding,
} from '../services/abstract-game-type-registry.service';

export const GAME_RESUME_HANDLERS = Symbol('GAME_RESUME_HANDLERS');

@Injectable()
export class GameResumeHandlerRegistryService
  extends AbstractGameTypeRegistry<GameResumeHandler>
  implements GameResumeHandlerRegistry
{
  constructor(
    @Inject(GAME_RESUME_HANDLERS)
    handlers: GameTypeBinding<GameResumeHandler>[],
  ) {
    super(handlers);
  }
}
