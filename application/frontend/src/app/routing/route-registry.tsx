import { injectable, multiInject } from 'inversify';
import type { RouteObject } from 'react-router-dom';
import { ROUTE_FACTORY, type RouteFactory } from '../../application/shared/contracts/routing.port';
import { HomeScreen } from '../../presentation/home/screens/home/home-screen';
import { NotFoundScreen } from '../../presentation/not-found/screens/not-found/not-found-screen';
import { AppShellLayout } from '../../presentation/shared/layouts/app-shell-layout';

export const ROUTE_REGISTRY = Symbol.for('routeRegistry');

@injectable()
export class RouteRegistry {
  constructor(
    @multiInject(ROUTE_FACTORY)
    private readonly routeFactories: RouteFactory[],
  ) {}

  getRoutes(): RouteObject[] {
    const children = this.routeFactories.flatMap((routeFactory) =>
      routeFactory.create(),
    ) as RouteObject[];

    return [
      {
        path: '/',
        element: <AppShellLayout />,
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
