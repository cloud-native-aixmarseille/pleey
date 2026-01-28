import { ContainerModule } from 'inversify';
import { HostCommandBarStateFacade } from '../../../application/game-session/live/host/facades/host-command-bar-state.facade';
import type { GameSessionHostControlRuntimePort } from '../../../application/game-session/live/host/ports/game-session-host-control-runtime.port';
import { GAME_SERVICE_ID } from '../../../application/game-session/live/shared/contracts/game-session-service-id';
import { CreateHostSessionUseCase } from '../../../application/game-session/management/use-cases/create-host-session-use-case';
import { ListActiveHostSessionsUseCase } from '../../../application/game-session/management/use-cases/list-active-host-sessions-use-case';
import { SocketIoGameSessionHostControlRuntime } from '../../../infrastructure/game-session/realtime/socket-io-game-session-host-control-runtime';

export const gameSessionHostModule = new ContainerModule(({ bind }) => {
  bind(SocketIoGameSessionHostControlRuntime).toSelf().inSingletonScope();
  bind<GameSessionHostControlRuntimePort>(GAME_SERVICE_ID.gameHostControlRuntime).toService(
    SocketIoGameSessionHostControlRuntime,
  );
  bind(HostCommandBarStateFacade).toSelf().inSingletonScope();
  bind(CreateHostSessionUseCase).toSelf().inSingletonScope();
  bind(ListActiveHostSessionsUseCase).toSelf().inSingletonScope();
});
