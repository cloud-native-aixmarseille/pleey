import { ContainerModule } from 'inversify';
import { JoinGameScreenFacade } from '../../../application/game-session/live/player/facades/join-game-screen.facade';
import type { GameSessionJoinRuntimePort } from '../../../application/game-session/live/player/ports/game-session-join-runtime.port';
import type { GameSessionLobbyRuntimePort } from '../../../application/game-session/live/player/ports/game-session-lobby-runtime.port';
import type { GameSessionPlayingRuntimePort } from '../../../application/game-session/live/player/ports/game-session-playing-runtime.port';
import { GetGameLobbyStateUseCase } from '../../../application/game-session/live/player/use-cases/get-game-lobby-state-use-case';
import { GetStageActionDistributionUseCase } from '../../../application/game-session/live/player/use-cases/get-stage-action-distribution-use-case';
import { JoinGameUseCase } from '../../../application/game-session/live/player/use-cases/join-game-use-case';
import { ListStageActionChoicesUseCase } from '../../../application/game-session/live/player/use-cases/list-stage-action-choices-use-case';
import { GAME_SERVICE_ID } from '../../../application/game-session/live/shared/contracts/game-session-service-id';
import type { RouteFactory } from '../../../application/shared/contracts/routing.port';
import type { GuestPlayerIdGeneratorPort } from '../../../domains/game-session/ports/guest-player-id-generator.port';
import { GameJoinErrorResolutionService } from '../../../domains/game-session/services/game-join-error-resolution.service';
import { GameLobbyErrorResolutionService } from '../../../domains/game-session/services/game-lobby-error-resolution.service';
import { GamePlayingErrorResolutionService } from '../../../domains/game-session/services/game-playing-error-resolution.service';
import { GuestPlayerIdentityService } from '../../../domains/game-session/services/guest-player-identity.service';
import { JoinGameFlowService } from '../../../domains/game-session/services/join-game-flow-service';
import { LeaderboardService } from '../../../domains/game-session/services/leaderboard-service';
import { LobbyService } from '../../../domains/game-session/services/lobby-service';
import { SocketIoGameSessionJoinRuntime } from '../../../infrastructure/game-session/realtime/socket-io-game-session-join-runtime';
import { SocketIoGameSessionLobbyRuntime } from '../../../infrastructure/game-session/realtime/socket-io-game-session-lobby-runtime';
import { SocketIoGameSessionPlayingRuntime } from '../../../infrastructure/game-session/realtime/socket-io-game-session-playing-runtime';
import { BrowserGuestPlayerIdGenerator } from '../../../infrastructure/game-session/runtimes/browser-guest-player-id-generator';
import { GameRoutesFactory } from '../../../presentation/game-session/live/shared/routes/game-routes-factory';
import { AppGameSessionRejoinRuntime } from '../../game-session/live/player/runtimes/app-game-session-rejoin-runtime';
import { AppGuestPlayerRuntime } from '../../game-session/live/player/runtimes/app-guest-player-runtime';
import { AppGameSessionRoutesFactory } from '../../game-session/live/session-shell/app-game-session-routes-factory';
import { TOKENS } from '../tokens';

export const gameSessionPlayerModule = new ContainerModule(({ bind }) => {
  bind(SocketIoGameSessionJoinRuntime).toSelf().inSingletonScope();
  bind(SocketIoGameSessionLobbyRuntime).toSelf().inSingletonScope();
  bind(SocketIoGameSessionPlayingRuntime).toSelf().inSingletonScope();
  bind<GameSessionJoinRuntimePort>(GAME_SERVICE_ID.gameJoinRuntime).toService(
    SocketIoGameSessionJoinRuntime,
  );
  bind<GameSessionLobbyRuntimePort>(GAME_SERVICE_ID.gameLobbyRuntime).toService(
    SocketIoGameSessionLobbyRuntime,
  );
  bind<GameSessionPlayingRuntimePort>(GAME_SERVICE_ID.gamePlayingRuntime).toService(
    SocketIoGameSessionPlayingRuntime,
  );
  bind(GuestPlayerIdentityService)
    .toDynamicValue(
      (context) =>
        new GuestPlayerIdentityService(
          context.get<GuestPlayerIdGeneratorPort>(GAME_SERVICE_ID.guestPlayerIdGenerator),
        ),
    )
    .inSingletonScope();
  bind(BrowserGuestPlayerIdGenerator).toSelf().inSingletonScope();
  bind<GuestPlayerIdGeneratorPort>(GAME_SERVICE_ID.guestPlayerIdGenerator).toService(
    BrowserGuestPlayerIdGenerator,
  );
  bind(AppGuestPlayerRuntime).toSelf().inSingletonScope();
  bind(AppGameSessionRejoinRuntime).toSelf().inSingletonScope();
  bind(JoinGameScreenFacade).toSelf().inSingletonScope();
  bind(JoinGameFlowService).toSelf().inSingletonScope();
  bind(JoinGameUseCase).toSelf().inSingletonScope();
  bind(GameJoinErrorResolutionService).toSelf().inSingletonScope();
  bind(GameLobbyErrorResolutionService).toSelf().inSingletonScope();
  bind(GamePlayingErrorResolutionService).toSelf().inSingletonScope();
  bind(LobbyService).toSelf().inSingletonScope();
  bind(LeaderboardService).toSelf().inSingletonScope();
  bind(ListStageActionChoicesUseCase).toSelf().inSingletonScope();
  bind(GetGameLobbyStateUseCase).toSelf().inSingletonScope();
  bind(GetStageActionDistributionUseCase).toSelf().inSingletonScope();
  bind(GameRoutesFactory).toSelf().inSingletonScope();
  bind(AppGameSessionRoutesFactory).toSelf().inSingletonScope();
  bind<RouteFactory>(TOKENS.routeFactory).toService(AppGameSessionRoutesFactory);
});
