import type { GameTypeCatalog, GameTypeDescriptor } from './game-type-catalog';

export class StaticGameTypeCatalog implements GameTypeCatalog {
  private readonly descriptors: readonly GameTypeDescriptor[];

  constructor(descriptors: readonly GameTypeDescriptor[]) {
    this.descriptors = [...descriptors];
  }

  list(): readonly GameTypeDescriptor[] {
    return [...this.descriptors];
  }
}
