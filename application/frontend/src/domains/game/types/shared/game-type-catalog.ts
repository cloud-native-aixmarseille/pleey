import type { GameType } from './game-type';

export interface GameTypeDescriptor {
  readonly key: GameType;
  readonly badge: string;
  readonly iconKey: string;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly managementRoutePath?: string;
}

export interface GameTypeCatalog {
  list(): readonly GameTypeDescriptor[];
}
