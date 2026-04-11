import { type RenderOptions, renderHook } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import type { RoutingPort } from '../application/shared/contracts/routing.port';
import { PresentationRoutingProvider } from '../presentation/shared/routing/router';
import { renderWithUiProvider } from './render-with-ui-provider';

export function renderWithRoutingProvider(
  ui: ReactElement,
  routingPort: RoutingPort,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  return renderWithUiProvider(
    <PresentationRoutingProvider value={routingPort}>{ui}</PresentationRoutingProvider>,
    options,
  );
}

export function renderHookWithRoutingProvider<TResult>(
  hook: () => TResult,
  routingPort: RoutingPort,
) {
  return renderHook(hook, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <PresentationRoutingProvider value={routingPort}>{children}</PresentationRoutingProvider>
    ),
  });
}
