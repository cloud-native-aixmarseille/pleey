import type { GameTypeDescriptor } from '../../../domains/game-catalog/entities/game-type-catalog';

export interface GameTypeCatalogFacade {
  readonly descriptor: GameTypeDescriptor;
}
