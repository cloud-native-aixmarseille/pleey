import { Inject, Injectable } from '@nestjs/common';
import type { GameId } from '../../../../domain/game/entities/game';
import { AbstractGameTypeRegistry, type GameTypeBinding } from './abstract-game-type-registry';

export interface GameTypePartyStageConfigurationProvider {
  getStageCount(gameId: GameId): Promise<number>;
}

export const GAME_TYPE_PARTY_STAGE_CONFIGURATION_PROVIDERS = Symbol(
  'GAME_TYPE_PARTY_STAGE_CONFIGURATION_PROVIDERS',
);

@Injectable()
export class GameTypePartyStageConfigurationProviderRegistry extends AbstractGameTypeRegistry<GameTypePartyStageConfigurationProvider> {
  constructor(
    @Inject(GAME_TYPE_PARTY_STAGE_CONFIGURATION_PROVIDERS)
    bindings: readonly GameTypeBinding<GameTypePartyStageConfigurationProvider>[],
  ) {
    super(bindings);
  }
}
