import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { runtimeContainer } from '../composition/runtime-container';
import { TOKENS } from '../composition/tokens';
import { RouteRegistry } from './route-registry';

const routeRegistry = runtimeContainer.get<RouteRegistry>(TOKENS.routeRegistry);
const router = createBrowserRouter(routeRegistry.getRoutes());

export function AppRouter() {
  return <RouterProvider router={router} />;
}
