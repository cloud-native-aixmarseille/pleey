import { Inject, Injectable } from '@nestjs/common';
import type {
  GameResumeSessionHandler,
  GameResumeSessionHandlerRegistry,
} from '../../../domain/game/ports/handlers/game-resume-session-handler.registry';
import {
  AbstractGameTypeRegistry,
  type GameTypeBinding,
} from '../services/abstract-game-type-registry.service';

export const GAME_RESUME_SESSION_HANDLERS = Symbol('GAME_RESUME_SESSION_HANDLERS');

@Injectable()
export class GameResumeSessionHandlerRegistryService
  extends AbstractGameTypeRegistry<GameResumeSessionHandler>
  implements GameResumeSessionHandlerRegistry
{
  constructor(
    @Inject(GAME_RESUME_SESSION_HANDLERS)
    handlers: GameTypeBinding<GameResumeSessionHandler>[],
  ) {
    super(handlers);
  }
}
