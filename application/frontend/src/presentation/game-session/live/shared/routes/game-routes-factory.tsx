import { inject, injectable } from 'inversify';
import { JoinGameScreenFacade } from '../../../../../application/game-session/live/player/facades/join-game-screen.facade';
import { GetCurrentPlayerSessionUseCase } from '../../../../../application/game-session/management/use-cases/get-current-player-session-use-case';
import type {
  PresentationRouteObject,
  RouteFactory,
} from '../../../../../application/shared/contracts/routing.port';
import { GameSessionRouteGuardService } from '../../../../../domains/game-session/services/game-session-route-guard.service';
import { GameSessionRoutingService } from '../../../../../domains/game-session/services/game-session-routing-service';
import { GameStageScreenRoutingService } from '../../../../../domains/game-session/services/game-stage-screen-routing.service';
import { JoinGameScreen } from '../../player/screens/join/join-game-screen';
import { LeaderboardScreen } from '../screens/leaderboard/leaderboard-screen';
import { GameLobbyScreen } from '../screens/lobby/game-lobby-screen';
import { StageScreen } from '../screens/stage/stage-screen';
import { GameSessionGuardLayout } from './game-session-guard-layout';

@injectable()
export class GameRoutesFactory implements RouteFactory {
  constructor(
    @inject(JoinGameScreenFacade)
    private readonly joinGameScreenFacade: JoinGameScreenFacade,
    @inject(GetCurrentPlayerSessionUseCase)
    private readonly getCurrentPlayerSessionUseCase: GetCurrentPlayerSessionUseCase,
    @inject(GameSessionRouteGuardService)
    private readonly gameSessionRouteGuardService: GameSessionRouteGuardService,
    @inject(GameSessionRoutingService)
    private readonly gameSessionRoutingService: GameSessionRoutingService,
    @inject(GameStageScreenRoutingService)
    private readonly gameStageScreenRoutingService: GameStageScreenRoutingService,
  ) {}

  create(): PresentationRouteObject[] {
    return [
      {
        path: 'game/join',
        element: (
          <JoinGameScreen
            joinGameScreenFacade={this.joinGameScreenFacade}
            loadCurrentPlayerSession={() => this.getCurrentPlayerSessionUseCase.execute()}
            resolveSessionEntryRoute={(session) =>
              this.gameSessionRoutingService.resolveEntryRoute(session)
            }
          />
        ),
      },
      {
        path: 'game/:sessionPin',
        element: <GameSessionGuardLayout routeGuardService={this.gameSessionRouteGuardService} />,
        children: [
          {
            path: 'lobby',
            element: <GameLobbyScreen />,
          },
          {
            path: 'stage/:stageId',
            element: <StageScreen stageScreenRoutingService={this.gameStageScreenRoutingService} />,
          },
          {
            path: 'stage/:stageId/result',
            element: <StageScreen stageScreenRoutingService={this.gameStageScreenRoutingService} />,
          },
          {
            path: 'leaderboard',
            element: <LeaderboardScreen />,
          },
        ],
      },
    ];
  }
}
