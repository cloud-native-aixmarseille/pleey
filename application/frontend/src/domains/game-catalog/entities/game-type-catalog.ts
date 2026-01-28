export interface GameTypeDescriptor {
  readonly key: string;
  readonly badge: string;
  readonly iconKey: string;
  readonly titleKey: string;
  readonly descriptionKey: string;
  readonly managementRoutePath?: string;
}

export class GameTypeCatalog {
  constructor(private readonly descriptors: readonly GameTypeDescriptor[]) {}

  list(): readonly GameTypeDescriptor[] {
    return [...this.descriptors];
  }
}
