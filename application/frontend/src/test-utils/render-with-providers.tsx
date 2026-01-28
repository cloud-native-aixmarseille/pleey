import { type RenderOptions, render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '../app/bootstrap/app-providers';
import { AppGameSessionTestHarness } from '../app/game-session/live/session-shell/app-game-session-test-harness';

interface RenderWithProvidersOptions extends Omit<RenderOptions, 'wrapper'> {
  readonly initialPath?: string;
}

export function renderWithProviders(
  ui: ReactElement,
  { initialPath = '/', ...options }: RenderWithProvidersOptions = {},
) {
  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter initialEntries={[initialPath]}>
        <AppProviders>
          <AppGameSessionTestHarness>{children}</AppGameSessionTestHarness>
        </AppProviders>
      </MemoryRouter>
    ),
    ...options,
  });
}
