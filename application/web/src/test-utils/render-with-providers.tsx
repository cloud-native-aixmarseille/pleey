import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { createAppProviderFactories } from '../app/bootstrap/app-provider-factory';
import { AppProviders } from '../app/bootstrap/app-providers';
import { createAppContainer } from '../app/bootstrap/create-app-container';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  readonly initialPath?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  { initialPath = '/', ...options }: RenderWithProvidersOptions = {},
) {
  const container = createAppContainer();
  const providerFactories = createAppProviderFactories(container);

  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[initialPath]}>
        <AppProviders providerFactories={providerFactories}>{children}</AppProviders>
      </MemoryRouter>
    ),
    ...options,
  });
}
