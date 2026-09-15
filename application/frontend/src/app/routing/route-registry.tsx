import { inject, injectable, multiInject } from 'inversify';
import type { RouteObject } from 'react-router-dom';
import {
  APPLICATION_SHELL_CONFIG_PORT,
  type ApplicationShellConfigPort,
} from '../../application/shared/ports/application-shell-config.port';
import { ROUTE_FACTORY, type RouteFactory } from '../../application/shared/ports/routing.port';
import { HomeScreen } from '../../presentation/home/screens/home/home-screen';
import { NotFoundScreen } from '../../presentation/not-found/screens/not-found/not-found-screen';
import { AppShellLayout } from '../../presentation/shared/layouts/app-shell-layout';

export const ROUTE_REGISTRY = Symbol.for('routeRegistry');

@injectable()
export class RouteRegistry {
  constructor(
    @multiInject(ROUTE_FACTORY)
    private readonly routeFactories: RouteFactory[],
    @inject(APPLICATION_SHELL_CONFIG_PORT)
    private readonly applicationShellConfigPort: ApplicationShellConfigPort,
  ) {}

  getRoutes(): RouteObject[] {
    const children = this.routeFactories.flatMap((routeFactory) => routeFactory.create()) as RouteObject[];

    return [
      {
        path: '/',
        element: (
          <AppShellLayout loadShellConfig={() => this.applicationShellConfigPort.loadApplicationShellConfig()} />
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
