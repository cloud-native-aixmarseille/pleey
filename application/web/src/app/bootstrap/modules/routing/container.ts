import { type Container, ContainerModule } from 'inversify';
import { createBrowserRouter } from 'react-router-dom';
import {
  APPLICATION_SHELL_CONFIG_PORT,
  type ApplicationShellConfigPort,
} from '../../../../application/shared/ports/application-shell-config.port';
import { HttpApplicationShellConfigAdapter } from '../../../../infrastructure/config/http-application-shell-config.adapter';
import { ROUTE_REGISTRY, RouteRegistry } from '../../../routing/route-registry';
import { AppProviderFactoryToken } from '../../app-provider-factory';
import { AppRoutingProviderFactory } from './app-routing-provider-factory';

export const routingContainerModule = new ContainerModule(({ bind }) => {
  bind(HttpApplicationShellConfigAdapter).toSelf().inSingletonScope();
  bind<ApplicationShellConfigPort>(APPLICATION_SHELL_CONFIG_PORT).toService(HttpApplicationShellConfigAdapter);
  bind<RouteRegistry>(ROUTE_REGISTRY).to(RouteRegistry).inSingletonScope();
  bind(AppRoutingProviderFactory).toSelf().inSingletonScope();
  bind(AppProviderFactoryToken).toService(AppRoutingProviderFactory);
});

export function createAppRouter(container: Container): ReturnType<typeof createBrowserRouter> {
  const routeRegistry = container.get<RouteRegistry>(ROUTE_REGISTRY);
  return createBrowserRouter(routeRegistry.getRoutes());
}
