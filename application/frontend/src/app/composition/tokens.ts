import { GAME_TYPE_CATALOG_GATEWAY } from '../../application/game-catalog/gateways/game-type-module.gateway';
import { WORKSPACE_SELECTION_PORT } from '../../application/workspace/contracts/workspace-selection.port';

export const TOKENS = {
  routeRegistry: Symbol.for('routeRegistry'),
  routeFactory: Symbol.for('routeFactory'),
  gameTypeCatalogGateway: GAME_TYPE_CATALOG_GATEWAY,
  gameTypeCatalogFacade: Symbol.for('gameTypeCatalogFacade'),
  gameTypeLiveFacade: Symbol.for('gameTypeLiveFacade'),
  workspaceSelectionPort: WORKSPACE_SELECTION_PORT,
} as const;
