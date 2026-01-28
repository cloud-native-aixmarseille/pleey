import { Inject, Injectable } from '@nestjs/common';
import type {
  GameContentProvider,
  GameContentProviderRegistry,
} from '../../../domain/game/ports/services/game-content-provider';
import {
  AbstractGameTypeRegistry,
  type GameTypeBinding,
} from './abstract-game-type-registry.service';

export const GAME_CONTENT_PROVIDERS = Symbol('GAME_CONTENT_PROVIDERS');

@Injectable()
export class GameContentProviderRegistryService
  extends AbstractGameTypeRegistry<GameContentProvider>
  implements GameContentProviderRegistry
{
  constructor(
    @Inject(GAME_CONTENT_PROVIDERS)
    contentProviders: GameTypeBinding<GameContentProvider>[],
  ) {
    super(contentProviders);
  }
}
