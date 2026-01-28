import { inject, injectable } from 'inversify';
import { lazy, Suspense } from 'react';
import type { GameSessionRoutingGateway } from '../../../../application/game-session/live/shared/gateways/game-session-routing.gateway';
import type {
  PresentationRouteObject,
  RouteFactory,
} from '../../../../application/shared/contracts/routing.port';
import { GameSessionRoutingService } from '../../../../domains/game-session/services/game-session-routing-service';
import { GameRoutesFactory } from '../../../../presentation/game-session/live/shared/routes/game-routes-factory';
import {
  type GameSessionRouteContextValue,
  GameSessionRouteProvider,
} from '../../../../presentation/shared/routing/game-session-route-context';

const LazyAppGameSessionRootLayout = lazy(async () => {
  const module = await import('./app-game-session-root-layout');

  return { default: module.AppGameSessionRootLayout };
});

const LazyAppGameSessionRuntimeLayout = lazy(async () => {
  const module = await import('./app-game-session-runtime-layout');

  return { default: module.AppGameSessionRuntimeLayout };
});

function AppGameSessionRootRouteLayout() {
  return (
    <Suspense fallback={null}>
      <LazyAppGameSessionRootLayout />
    </Suspense>
  );
}

function AppGameSessionRuntimeRouteLayout() {
  return (
    <Suspense fallback={null}>
      <LazyAppGameSessionRuntimeLayout />
    </Suspense>
  );
}

function splitSessionRoutes(children: PresentationRouteObject[]): {
  readonly gameJoinRoute?: PresentationRouteObject;
  readonly gameSessionRoute?: PresentationRouteObject;
} {
  let gameJoinRoute: PresentationRouteObject | undefined;
  let gameSessionRoute: PresentationRouteObject | undefined;

  for (const child of children) {
    if (child.path === 'game/join') {
      gameJoinRoute = child;
      continue;
    }

    if (child.path === 'game/:sessionPin') {
      gameSessionRoute = child;
    }
  }

  return {
    gameJoinRoute,
    gameSessionRoute,
  };
}

export function createAppGameSessionRouteBindings(
  routingGateway: GameSessionRoutingGateway,
): GameSessionRouteContextValue {
  return {
    resolveJoinRoute: (pin?: string) => routingGateway.resolveJoinRoute(pin),
    resolveLobbyRoute: (pin: string) => routingGateway.resolveLobbyRoute(pin),
    resolveStageRoute: (pin: string, stageId: number) =>
      routingGateway.resolveStageRoute(pin, stageId),
    resolveStageResultRoute: (pin: string, stageId: number) =>
      routingGateway.resolveStageResultRoute(pin, stageId),
    resolveStageRouteForStage: (pin: string, stage: { id: number }) =>
      routingGateway.resolveStageRoute(pin, stage.id),
    resolveStageResultRouteForStage: (pin: string, stage: { id: number }) =>
      routingGateway.resolveStageResultRoute(pin, stage.id),
    resolveLeaderboardRoute: (pin: string) => routingGateway.resolveLeaderboardRoute(pin),
  };
}

function createAppGameSessionRouteTree(
  children: PresentationRouteObject[],
  routeBindings: GameSessionRouteContextValue,
): PresentationRouteObject[] {
  const { gameJoinRoute, gameSessionRoute } = splitSessionRoutes(children);

  if (!gameJoinRoute && !gameSessionRoute) {
    return [];
  }

  const gameChildren: PresentationRouteObject[] = [];

  if (gameJoinRoute) {
    const { index: _joinIndex, ...joinRoute } = gameJoinRoute;

    gameChildren.push({
      ...joinRoute,
      path: 'join',
    });
  }

  if (gameSessionRoute) {
    const {
      children: sessionChildren,
      element: sessionElement,
      index: _sessionIndex,
      ...sessionRoute
    } = gameSessionRoute;

    gameChildren.push({
      ...sessionRoute,
      path: ':sessionPin',
      element: <AppGameSessionRuntimeRouteLayout />,
      children: [
        {
          element: sessionElement,
          children: sessionChildren,
        },
      ],
    });
  }

  return [
    {
      path: 'game',
      element: (
        <GameSessionRouteProvider value={routeBindings}>
          <AppGameSessionRootRouteLayout />
        </GameSessionRouteProvider>
      ),
      children: gameChildren,
    },
  ];
}

@injectable()
export class AppGameSessionRoutesFactory implements RouteFactory {
  constructor(
    @inject(GameRoutesFactory)
    private readonly gameRoutesFactory: GameRoutesFactory,
    @inject(GameSessionRoutingService)
    private readonly gameSessionRoutingService: GameSessionRoutingService,
  ) {}

  create() {
    return createAppGameSessionRouteTree(
      this.gameRoutesFactory.create(),
      createAppGameSessionRouteBindings(this.gameSessionRoutingService),
    );
  }
}
