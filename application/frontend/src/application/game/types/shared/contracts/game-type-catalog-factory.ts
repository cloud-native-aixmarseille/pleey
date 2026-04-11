import type {
  GameTypeCatalog,
  GameTypeDescriptor,
} from '../../../../../domains/game/types/shared/game-type-catalog';

export interface GameTypeCatalogFactory {
  create(descriptors: readonly GameTypeDescriptor[]): GameTypeCatalog;
}

export const GameTypeCatalogFactoryToken = Symbol('GameTypeCatalogFactory');
