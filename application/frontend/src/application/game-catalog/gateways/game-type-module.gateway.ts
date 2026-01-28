import type { GameTypeCatalog } from '../../../domains/game-catalog/entities/game-type-catalog';

export const GAME_TYPE_CATALOG_GATEWAY = Symbol.for('gameTypeCatalogGateway');

export interface GameTypeCatalogGateway {
  listCatalog(): GameTypeCatalog;
}
