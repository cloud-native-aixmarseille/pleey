import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { createAppProviderFactories } from '../app/bootstrap/app-provider-factory';
import { AppProviders } from '../app/bootstrap/app-providers';
import { createAppContainer } from '../app/bootstrap/create-app-container';

export function renderWithDataRouter(ui: ReactElement, { initialPath = '/' } = {}) {
  const providerFactories = createAppProviderFactories(createAppContainer());
  const router = createMemoryRouter(
    [{ path: '*', element: <AppProviders providerFactories={providerFactories}>{ui}</AppProviders> }],
    { initialEntries: [initialPath] },
  );
  return { ...render(<RouterProvider router={router} />), router };
}
