import { inject, injectable, multiInject } from 'inversify';
import type { RouteObject } from 'react-router-dom';
import type { RouteFactory } from '../../application/shared/contracts/routing.port';
import { GameSessionRoutingService } from '../../domains/game-session/services/game-session-routing-service';
import { HomeScreen } from '../../presentation/home/screens/home/home-screen';
import { NotFoundScreen } from '../../presentation/not-found/screens/not-found/not-found-screen';
import { AppShellLayout } from '../../presentation/shared/layouts/app-shell-layout';
import { GameSessionRouteProvider } from '../../presentation/shared/routing/game-session-route-context';
import { TOKENS } from '../composition/tokens';
import { createAppGameSessionRouteBindings } from '../game-session/live/session-shell/app-game-session-routes-factory';

@injectable()
export class RouteRegistry {
  constructor(
    @multiInject(TOKENS.routeFactory)
    private readonly routeFactories: RouteFactory[],
    @inject(GameSessionRoutingService)
    private readonly gameSessionRoutingService: GameSessionRoutingService,
  ) {}

  getRoutes(): RouteObject[] {
    const children = this.routeFactories.flatMap((routeFactory) =>
      routeFactory.create(),
    ) as RouteObject[];
    const gameSessionRoutes = createAppGameSessionRouteBindings(this.gameSessionRoutingService);

    return [
      {
        path: '/',
        element: (
          <GameSessionRouteProvider value={gameSessionRoutes}>
            <AppShellLayout />
          </GameSessionRouteProvider>
        ),
        children: [
          {
            index: true,
            element: <HomeScreen />,
          },
          ...children,
          {
            path: '*',
            element: <NotFoundScreen />,
          },
        ],
      },
    ];
  }
}
