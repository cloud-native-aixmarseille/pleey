import type { GameTypeCatalogGateway } from '../../application/game-catalog/gateways/game-type-module.gateway';
import {
  GameTypeCatalog,
  type GameTypeDescriptor,
} from '../../domains/game-catalog/entities/game-type-catalog';
import { createGameTypeDescriptorFixture } from './game-type-descriptor-fixture-factory';

interface GameTypeCatalogGatewayMockOptions {
  readonly descriptors?: readonly GameTypeDescriptor[];
}

export class GameTypeCatalogGatewayMockFactory {
  create({
    descriptors = this.createDefaultDescriptors(),
  }: GameTypeCatalogGatewayMockOptions = {}): GameTypeCatalogGateway {
    return {
      listCatalog: () => new GameTypeCatalog(descriptors),
    };
  }

  private createDefaultDescriptors(): readonly GameTypeDescriptor[] {
    return [
      createGameTypeDescriptorFixture({ key: 'quiz' }),
      createGameTypeDescriptorFixture({ key: 'prediction' }),
    ];
  }
}
