import { type RenderResult, render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { createMemoryRouter, type RouteObject, RouterProvider } from 'react-router-dom';
import { createAppProviderFactories } from '../app/bootstrap/app-provider-factory';
import { AppProviders } from '../app/bootstrap/app-providers';
import { createAppContainer } from '../app/bootstrap/create-app-container';

interface RenderRouteWithProvidersOptions {
  readonly initialEntries?: string[];
  readonly routes: RouteObject[];
}

export function renderRouteWithProviders({
  initialEntries = ['/'],
  routes,
}: RenderRouteWithProvidersOptions): RenderResult {
  const router = createMemoryRouter(routes, { initialEntries });
  const container = createAppContainer();
  const providerFactories = createAppProviderFactories(container);

  return render(
    <AppProviders providerFactories={providerFactories}>
      <RouterProvider router={router} />
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
