import type { GameTypeCatalogGateway } from '../../application/game/types/shared/gateways/game-type-catalog.gateway';
import { GameType } from '../../domains/game/types/shared/game-type';
import type { GameTypeDescriptor } from '../../domains/game/types/shared/game-type-catalog';
import { StaticGameTypeCatalog } from '../../domains/game/types/shared/static-game-type-catalog';
import { createGameTypeDescriptorFixture } from '../fixtures/game-type-descriptor-fixture-factory';

interface GameTypeCatalogGatewayMockOptions {
  readonly descriptors?: readonly GameTypeDescriptor[];
}

export class GameTypeCatalogGatewayMockFactory {
  create({
    descriptors = this.createDefaultDescriptors(),
  }: GameTypeCatalogGatewayMockOptions = {}): GameTypeCatalogGateway {
    return {
      listCatalog: () => new StaticGameTypeCatalog(descriptors),
    };
  }

  private createDefaultDescriptors(): readonly GameTypeDescriptor[] {
    return [
      createGameTypeDescriptorFixture({ key: GameType.Quiz }),
      createGameTypeDescriptorFixture({ key: GameType.Prediction }),
    ];
  }
}
