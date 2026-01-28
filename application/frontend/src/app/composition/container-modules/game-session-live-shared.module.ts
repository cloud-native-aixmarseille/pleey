import { ContainerModule } from 'inversify';
import {
  GAME_TYPE_CATALOG_GATEWAY,
  type GameTypeCatalogGateway,
} from '../../../application/game-catalog/gateways/game-type-module.gateway';
import { GAME_SERVICE_ID } from '../../../application/game-session/live/shared/contracts/game-session-service-id';
import {
  GAME_SESSION_ROUTING_GATEWAY,
  type GameSessionRoutingGateway,
} from '../../../application/game-session/live/shared/gateways/game-session-routing.gateway';
import { GetActiveHostSessionByPinUseCase } from '../../../application/game-session/management/use-cases/get-active-host-session-by-pin-use-case';
import { GetCurrentPlayerSessionUseCase } from '../../../application/game-session/management/use-cases/get-current-player-session-use-case';
import { LeaveCurrentPlayerSessionUseCase } from '../../../application/game-session/management/use-cases/leave-current-player-session-use-case';
import { GameSessionRouteGuardService } from '../../../domains/game-session/services/game-session-route-guard.service';
import { GameSessionRoutingService } from '../../../domains/game-session/services/game-session-routing-service';
import { GameStageScreenRoutingService } from '../../../domains/game-session/services/game-stage-screen-routing.service';
import { RegisteredGameTypeCatalogGateway } from '../../../infrastructure/game-catalog/gateways/registered-game-type-module.gateway';
import { SocketIoGameSessionConnection } from '../../../infrastructure/game-session/realtime/socket-io-game-session-connection';
import { GraphqlGameSessionRepository } from '../../../infrastructure/game-session/repositories/graphql-game-session.repository';

export const gameSessionSharedModule = new ContainerModule(({ bind }) => {
  bind(SocketIoGameSessionConnection).toSelf().inSingletonScope();
  bind(GameSessionRouteGuardService).toSelf().inSingletonScope();
  bind(GameStageScreenRoutingService).toSelf().inSingletonScope();
  bind(GameSessionRoutingService).toSelf().inSingletonScope();
  bind(GetActiveHostSessionByPinUseCase).toSelf().inSingletonScope();
  bind(GetCurrentPlayerSessionUseCase).toSelf().inSingletonScope();
  bind(LeaveCurrentPlayerSessionUseCase).toSelf().inSingletonScope();
  bind<GameSessionRoutingGateway>(GAME_SESSION_ROUTING_GATEWAY).toService(
    GameSessionRoutingService,
  );
  bind(GAME_SERVICE_ID.gameSessionRepository).to(GraphqlGameSessionRepository).inSingletonScope();
  bind(RegisteredGameTypeCatalogGateway).toSelf().inSingletonScope();
  bind<GameTypeCatalogGateway>(GAME_TYPE_CATALOG_GATEWAY).toService(
    RegisteredGameTypeCatalogGateway,
  );
});
