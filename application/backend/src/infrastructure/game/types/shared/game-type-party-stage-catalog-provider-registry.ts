import { Inject, Injectable } from '@nestjs/common';
import type { PartyStageCatalogEntry } from '../../../../application/game/types/shared/ports/party-stage-catalog.port';
import type { GameId } from '../../../../domain/game/entities/game';
import type { PartyStageId } from '../../../../domain/game/party/shared/entities/party-stage';
import { AbstractGameTypeRegistry, type GameTypeBinding } from './abstract-game-type-registry';

export interface GameTypePartyStageCatalogProvider {
  findFirstStage(gameId: GameId): Promise<PartyStageCatalogEntry | null>;
  findNextStage(
    gameId: GameId,
    currentStageId: PartyStageId,
  ): Promise<PartyStageCatalogEntry | null>;
  findPreviousStage(
    gameId: GameId,
    currentStageId: PartyStageId,
  ): Promise<PartyStageCatalogEntry | null>;
  findStageById(gameId: GameId, stageId: PartyStageId): Promise<PartyStageCatalogEntry | null>;
  listStages(gameId: GameId): Promise<readonly PartyStageCatalogEntry[]>;
}

export const GAME_TYPE_PARTY_STAGE_CATALOG_PROVIDERS = Symbol(
  'GAME_TYPE_PARTY_STAGE_CATALOG_PROVIDERS',
);

@Injectable()
export class GameTypePartyStageCatalogProviderRegistry extends AbstractGameTypeRegistry<GameTypePartyStageCatalogProvider> {
  constructor(
    @Inject(GAME_TYPE_PARTY_STAGE_CATALOG_PROVIDERS)
    bindings: readonly GameTypeBinding<GameTypePartyStageCatalogProvider>[],
  ) {
    super(bindings);
  }
}
