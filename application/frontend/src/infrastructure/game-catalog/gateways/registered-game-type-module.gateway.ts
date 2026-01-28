import { injectable, multiInject } from 'inversify';
import { TOKENS } from '../../../app/composition/tokens';
import type { GameTypeCatalogFacade } from '../../../application/game-catalog/contracts/game-type-module-facade';
import type { GameTypeCatalogGateway } from '../../../application/game-catalog/gateways/game-type-module.gateway';
import { GameTypeCatalog } from '../../../domains/game-catalog/entities/game-type-catalog';

@injectable()
export class RegisteredGameTypeCatalogGateway implements GameTypeCatalogGateway {
  constructor(
    @multiInject(TOKENS.gameTypeCatalogFacade)
    private readonly facades: readonly GameTypeCatalogFacade[],
  ) {}

  listCatalog(): GameTypeCatalog {
    return new GameTypeCatalog(
      [...this.facades]
        .map((facade) => facade.descriptor)
        .sort((left, right) => left.badge.localeCompare(right.badge)),
    );
  }
}
