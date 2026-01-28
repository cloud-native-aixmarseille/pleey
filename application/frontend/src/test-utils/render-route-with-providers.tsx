import { type RenderResult, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createMemoryRouter, type RouteObject, RouterProvider } from 'react-router-dom';
import { AppProviders } from '../app/bootstrap/app-providers';
import { AppGameSessionTestHarness } from '../app/game-session/live/session-shell/app-game-session-test-harness';

interface RenderRouteWithProvidersOptions {
  readonly initialEntries?: string[];
  readonly routes: RouteObject[];
}

export function renderRouteWithProviders({
  initialEntries = ['/'],
  routes,
}: RenderRouteWithProvidersOptions): RenderResult {
  const router = createMemoryRouter(routes, { initialEntries });

  return render(
    <AppProviders>
      <AppGameSessionTestHarness>
        <RouterProvider router={router} />
      </AppGameSessionTestHarness>
    </AppProviders>,
  );
}

export function createOutletRoute(element: ReactNode, outletContent: ReactNode): RouteObject[] {
  return [
    {
      path: '/',
      element,
      children: [{ index: true, element: outletContent }],
    },
  ];
}
